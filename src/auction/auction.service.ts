import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuctionTickService } from '@/auction/auction-tick.service';
import { AuctionRepository } from '@/auction/auction.repository';
import { SYSTEM_USE_ONLY_STATION_CODENAME } from '@/common/consts/station.const';
import { AuctionStateEnum } from '@/common/enums/auction-state.enum';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class AuctionService {
  private auctionState: AuctionStateEnum = AuctionStateEnum.ENDED_AUCTION;
  private auctionId: string | null = null;
  private prepareDurationInSeconds = 10;
  private durationInSeconds = 60;

  private readonly logger = new Logger(AuctionService.name);

  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly auctionTickService: AuctionTickService,
    private readonly teamRepository: TeamRepository,
  ) {
  }

  async recordAuctionBid(bidderTeamId: string, bidPrice: number) {
    if (!this.auctionId) {
      throw new NotFoundException('No auction is currently active.');
    }

    if (this.auctionState !== AuctionStateEnum.LIVE_AUCTION) {
      throw new NotFoundException('The auction is not currently live.');
    }

    if (bidPrice <= 0) {
      throw new NotFoundException('Bid price must be greater than zero.');
    }

    const team = (await this.teamRepository.findTeamById(bidderTeamId));
    if (!team) {
      throw new NotFoundException(`Team with ID ${bidderTeamId} not found.`);
    }
    const bidderTeamUsername = team.username;
    const teamCoins = await this.teamRepository.getTeamCoins(bidderTeamUsername);
    if (teamCoins === null || teamCoins < bidPrice) {
      throw new NotFoundException(`Team ${bidderTeamUsername} does not have enough coins to place this bid.`);
    }

    this.logger.log(`Bid by ${bidderTeamUsername} for ${bidPrice} coins`);
    await this.auctionRepository.createBid(this.auctionId!, team._id!.toString(), bidPrice);
  }

  async createAuction(skillCard: SkillCardEnum, prepareDurationInSeconds: number, durationInSeconds: number) {
    const auction = await this.auctionRepository.createAuction(skillCard, prepareDurationInSeconds, durationInSeconds);
    this.auctionId = auction._id.toString();

    this.prepareDurationInSeconds = prepareDurationInSeconds;
    this.durationInSeconds = durationInSeconds;
    void this.startAuctionPreparation();
  }

  async startAuctionPreparation() {
    this.auctionState = AuctionStateEnum.PRE_AUCTION;
    await this.auctionTickService.start(this.prepareDurationInSeconds, (tick) => {
      this.logger.log(`Preparation tick ${tick}`);
    });

    void this.startMainAuction();
  }

  async startMainAuction() {
    this.auctionState = AuctionStateEnum.LIVE_AUCTION;
    await this.auctionTickService.start(this.durationInSeconds, (tick) => {
      this.logger.log(`Live auction tick ${tick}`);
    });

    void this.endAuction();
  }

  async endAuction() {
    this.auctionState = AuctionStateEnum.ENDED_AUCTION;

    const auction = await this.auctionRepository.findAuctionById(this.auctionId!);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const { winner, losers } = await this.auctionRepository.getAuctionWinnerLoser(this.auctionId!);

    if (!winner) {
      this.logger.log('No winner found for the auction.');
      this.auctionId = null; // Reset auction ID
      return;
    }

    this.logger.log(`Auction ended. Winner: ${winner.team.username}, Losers: ${losers.map(l => l.team.username).join(', ')}`);

    // Add the skill card to the winning team
    await this.teamRepository.addSkillCardToTeam(winner.team.username, auction.skillCard);
    this.logger.log(`Skill card ${auction.skillCard} added to team ${winner.team.username}`);

    // Remove the winning team's coins
    await this.teamRepository.updateTeamCoins(SYSTEM_USE_ONLY_STATION_CODENAME, winner.team.username, -winner.auctionedPrice, `Auction ${this.auctionId} win`);
    this.logger.log(`Deducted ${winner.auctionedPrice} coins from team ${winner.team.username}`);

    for (const loser of losers) {
      await this.teamRepository.updateTeamCoins(SYSTEM_USE_ONLY_STATION_CODENAME, loser.team.username, -(loser.auctionedPrice / 2), `Auction ${this.auctionId} loss`);
      this.logger.log(`Deducted ${loser.auctionedPrice / 2} coins from team ${loser.team.username}`);
    }

    this.auctionId = null; // Reset auction ID
  }

  async getCurrentAuction() {
    if (!this.auctionId) {
      throw new NotFoundException('No auction is currently active.');
    }
    return await this.auctionRepository.findAuctionById(this.auctionId);
  }

  async getAuctionHistory(auctionId?: string) {
    if (auctionId) {
      return await this.auctionRepository.getAuctionHistory(auctionId);
    }

    if (!this.auctionId) {
      throw new NotFoundException('No auction is currently active.');
    }

    return await this.auctionRepository.getAuctionHistory(this.auctionId);
  }

  async getTeamsLatestBids(auctionId?: string) {
    if (auctionId) {
      return await this.auctionRepository.getBids(auctionId);
    }

    if (!this.auctionId) {
      throw new NotFoundException('No auction is currently active.');
    }

    return await this.auctionRepository.getBids(this.auctionId);
  }

  canSeeOtherTeamsCoins() {
    return this.auctionState === AuctionStateEnum.PRE_AUCTION;
  }

  getAuctionStatus() {
    return this.auctionState.toString();
  }
}
