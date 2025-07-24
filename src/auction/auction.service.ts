import { Injectable, NotFoundException } from '@nestjs/common';
import { AuctionTickService } from '@/auction/auction-tick.service';
import { AuctionRepository } from '@/auction/auction.repository';
import { AuctionStateEnum } from '@/common/enums/auction-state.enum';

@Injectable()
export class AuctionService {
  private auctionState: AuctionStateEnum = AuctionStateEnum.ENDED_AUCTION;
  private auctionId: string | null = null;
  private prepareDurationInSeconds = 10;
  private durationInSeconds = 60;

  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly auctionTickService: AuctionTickService,
  ) {}

  async recordAuctionBid(bidderTeamUsername: string, bidPrice: number) {
    if (!this.auctionId) {
      throw new NotFoundException('No auction is currently active.');
    }

    if (this.auctionState !== AuctionStateEnum.LIVE_AUCTION) {
      throw new NotFoundException('The auction is not currently live.');
    }

    if (bidPrice <= 0) {
      throw new NotFoundException('Bid price must be greater than zero.');
    }

    await this.auctionRepository.createBid(this.auctionId!, bidderTeamUsername, bidPrice);
  }

  async createAuction(itemId: string, prepareDurationInSeconds: number, durationInSeconds: number) {
    const auction = await this.auctionRepository.createAuction(itemId, prepareDurationInSeconds, durationInSeconds);
    this.auctionId = auction._id.toString();

    this.prepareDurationInSeconds = prepareDurationInSeconds;
    this.durationInSeconds = durationInSeconds;
    void this.startAuctionPreparation();
  }

  async startAuctionPreparation() {
    this.auctionState = AuctionStateEnum.PRE_AUCTION;
    await this.auctionTickService.start(this.prepareDurationInSeconds, () => {});

    void this.startMainAuction();
  }

  async startMainAuction() {
    this.auctionState = AuctionStateEnum.LIVE_AUCTION;
    await this.auctionTickService.start(this.durationInSeconds, () => {});

    void this.endAuction();
  }

  async endAuction() {
    this.auctionState = AuctionStateEnum.ENDED_AUCTION;

    const auction = await this.auctionRepository.findAuctionById(this.auctionId!);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // const winner = await this.auctionRepository.getAuctionWinner(this.auctionId!);

    // TODO: handle the winning/losing logic

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
      throw new Error('No auction is currently active.');
    }

    return await this.auctionRepository.getAuctionHistory(this.auctionId);
  }

  async getTeamsLatestBids(auctionId?: string) {
    if (auctionId) {
      return await this.auctionRepository.getTeamsLatestBids(auctionId);
    }

    if (!this.auctionId) {
      throw new Error('No auction is currently active.');
    }

    return await this.auctionRepository.getTeamsLatestBids(this.auctionId);
  }

  async canSeeOtherTeamsCoins() {
    return this.auctionState === AuctionStateEnum.PRE_AUCTION;
  }

  getAuctionStatus() {
    return this.auctionState.toString();
  }
}
