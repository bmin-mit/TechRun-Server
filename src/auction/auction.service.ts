import { Injectable, NotFoundException } from '@nestjs/common';
import { AuctionTickService } from '@/auction/auction-tick.service';
import { AuctionRepository } from '@/auction/auction.repository';
import { AuctionStateEnum } from '@/common/enums/auction-state.enum';
import { ItemRepository } from '@/item/item.repository';
import { NotificationService } from '@/notification/notification.service';

@Injectable()
export class AuctionService {
  private auctionState: AuctionStateEnum = AuctionStateEnum.ENDED_AUCTION;
  private auctionId: string | null = null;
  private prepareDurationInSeconds = 10;
  private durationInSeconds = 60;

  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly itemRepository: ItemRepository,
    private readonly notificationService: NotificationService,
    private readonly auctionTickService: AuctionTickService,
  ) {}

  async recordAuctionBid(bidderTeamId: string, item: string, bidPrice: number) {
    await this.auctionRepository.createBid(this.auctionId!, bidderTeamId, bidPrice);
  }

  async createAuction(itemId: string, prepareDurationInSeconds: number, durationInSeconds: number) {
    if (this.auctionState !== AuctionStateEnum.ENDED_AUCTION) {
      throw new Error('An auction is already in progress or has not ended yet.');
    }

    this.prepareDurationInSeconds = prepareDurationInSeconds;
    this.durationInSeconds = durationInSeconds;

    const item = this.itemRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const auction = await this.auctionRepository.createAuction(itemId, prepareDurationInSeconds, durationInSeconds);
    this.auctionId = auction._id.toString();
    this.auctionState = AuctionStateEnum.PRE_AUCTION;

    void this.startAuctionPreparation();
  }

  async startAuctionPreparation() {
    await this.notificationService.sendNewAuctionNotification();
    await this.auctionTickService.start(this.prepareDurationInSeconds, async (tick) => {
      await this.notificationService.sendTickToAuctionNotification(tick);
    });

    void this.startMainAuction();
  }

  async startMainAuction() {
    this.auctionState = AuctionStateEnum.LIVE_AUCTION;
    await this.notificationService.sendAuctionStartNotification(this.auctionId!);
    await this.auctionTickService.start(this.durationInSeconds, async (tick) => {
      await this.notificationService.sendAuctionTickNotification(tick);
    });

    void this.endAuction();
  }

  async endAuction() {
    this.auctionState = AuctionStateEnum.ENDED_AUCTION;

    const auction = await this.auctionRepository.findAuctionById(this.auctionId!);
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const winner = await this.auctionRepository.getAuctionWinner(this.auctionId!);
    await this.notificationService.sendAuctionEndNotification(winner.name, auction.item.name);

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
