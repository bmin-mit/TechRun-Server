import { PublicAnnouncementDto } from '@dtos/notification.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationHistory } from '@schemas/notification-history.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class NotificationRepository {
  constructor(@InjectModel(NotificationHistory.name) private readonly notificationHistoryModel: Model<NotificationHistory>) {}

  async createPublicAnnouncement(body: PublicAnnouncementDto, userId: mongoose.Types.ObjectId): Promise<NotificationHistory> {
    // eslint-disable-next-line new-cap
    const announcement = new this.notificationHistoryModel({
      title: body.title,
      content: body.content,
      isPublic: true,
      createdBy: userId,
    });

    return announcement.save();
  }
}
