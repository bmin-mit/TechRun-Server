import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationTypeEnum } from '@/common/enums/notification-type.enum';
import { AnnouncementDto } from '@/dtos/notification.dto';
import { NotificationHistory } from '@/schemas/notification-history.schema';

@Injectable()
export class NotificationRepository {
  constructor(@InjectModel(NotificationHistory.name) private readonly notificationHistoryModel: Model<NotificationHistory>) {}

  async createPublicAnnouncement(body: AnnouncementDto, userId: string): Promise<NotificationHistory> {
    // eslint-disable-next-line new-cap
    const announcement = new this.notificationHistoryModel({
      title: body.title,
      content: body.content,
      type: NotificationTypeEnum.PUBLIC_ANNOUNCEMENT,
      createdBy: userId,
    });

    return announcement.save();
  }

  async createTickToAuctionNotification(tick: number) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: '',
      content: `${tick}`,
      type: NotificationTypeEnum.AUCTION_TICK,
    });

    return notification.save();
  }

  async createAuctionStartNotification(item: string) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: 'Phiên đấu giá bắt đầu',
      content: `Phiên đấu giá cho vật phẩm ${item} đã bắt đầu.`,
      type: NotificationTypeEnum.AUCTION_START,
    });

    return notification.save();
  }

  async createAuctionTickNotification(tick: number) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: '',
      content: `${tick}`,
      type: NotificationTypeEnum.AUCTION_TICK,
    });

    return notification.save();
  }

  async createAuctionEndNotification(winnerName: string, item: string) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: 'Phiên đấu giá kết thúc',
      content: `Phiên đấu giá cho vật phẩm ${item} đã kết thúc. Đội thắng cuộc là ${winnerName}.`,
      type: NotificationTypeEnum.AUCTION_END,
    });

    return notification.save();
  }

  async createCoinsUpdateNotification(teamId: string, coins: number, reason: string) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: 'Coins update',
      content: `Team ${teamId} has been updated with the difference of ${coins} coins. Reason: ${reason}.`,
      type: NotificationTypeEnum.COINS_UPDATE,
      toTeam: teamId,
    });

    return notification.save();
  }

  async createItemUpdateNotification(teamId: string, itemId: string, quantity: number, reason: string) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: 'Item update',
      content: `Team ${teamId} has updated item ${itemId} with the difference of ${quantity}. Reason: ${reason}.`,
      type: NotificationTypeEnum.ITEM_UPDATE,
      toTeam: teamId,
    });

    return notification.save();
  }

  async createItemUsedOnNotification(teamId: string, itemId: string, objectiveTeamId?: string) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: 'Item used on team',
      content: objectiveTeamId ? `Team ${teamId} has used ${itemId} on team ${objectiveTeamId}.` : `Team ${teamId} has used ${itemId}.`,
      type: NotificationTypeEnum.ITEM_USED,
      toTeam: teamId,
    });

    return notification.save();
  }

  async createPrivateAnnouncementNotification(teamId: string, body: AnnouncementDto) {
    // eslint-disable-next-line new-cap
    const notification = new this.notificationHistoryModel({
      title: body.title,
      content: body.content,
      type: NotificationTypeEnum.PRIVATE_ANNOUNCEMENT,
      toTeam: teamId,
    });

    return notification.save();
  }
}
