import { Injectable } from '@nestjs/common';
import { AnnouncementDto } from '@/dtos/notification.dto';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationRepository } from '@/notification/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async sendPublicAnnouncement(body: AnnouncementDto, creatorUserId: string): Promise<void> {
    await this.notificationRepository.createPublicAnnouncement(body, creatorUserId);
    this.notificationGateway.sendPublicAnnouncement(body);
  }

  async sendNewAuctionNotification() {
    this.notificationGateway.sendPublicAnnouncement({
      title: 'New auction',
      content: '',
    });
  }

  async sendTickToAuctionNotification(tick: number) {
    await this.notificationRepository.createTickToAuctionNotification(tick);
    this.notificationGateway.sendTickToAuctionNotification(tick);
  }

  async sendAuctionStartNotification(item: string) {
    await this.notificationRepository.createAuctionStartNotification(item);
    this.notificationGateway.sendAuctionStartNotification(item);
  }

  async sendAuctionTickNotification(tick: number) {
    await this.notificationRepository.createAuctionTickNotification(tick);
    this.notificationGateway.sendAuctionTickNotification(tick);
  }

  async sendAuctionBidNotificationToAdmin() {
    // The client will automatically reload the auction history collection to get the prices
    this.notificationGateway.sendAuctionBidNotificationToAdmin();
  }

  async sendAuctionEndNotification(winner: string, item: string) {
    await this.notificationRepository.createAuctionEndNotification(winner, item);
    this.notificationGateway.sendAuctionEndNotification(winner, item);
  }

  async sendCoinsUpdateNotification(teamId: string, coins: number, reason: string) {
    await this.notificationRepository.createCoinsUpdateNotification(teamId, coins, reason);
    this.notificationGateway.sendCoinsUpdateNotification(teamId, coins, reason);
  }

  async sendItemUpdateNotification(teamId: string, itemId: string, quantity: number, reason: string) {
    await this.notificationRepository.createItemUpdateNotification(teamId, itemId, quantity, reason);
    this.notificationGateway.sendItemUpdateNotification(teamId, itemId, quantity, reason);
  }

  async sendItemUsedOnNotification(teamId: string, itemId: string, objectiveTeamId?: string) {
    await this.notificationRepository.createItemUsedOnNotification(teamId, itemId, objectiveTeamId);
    this.notificationGateway.sendItemUsedOnNotification(teamId, itemId, objectiveTeamId);
  }

  async sendPrivateAnnouncementNotification(teamId: string, body: AnnouncementDto) {
    await this.notificationRepository.createPrivateAnnouncementNotification(teamId, body);
    this.notificationGateway.sendPrivateAnnouncementNotification(teamId, body);
  }
}
