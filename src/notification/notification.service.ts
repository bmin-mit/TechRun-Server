import { PublicAnnouncementDto } from '@dtos/notification.dto';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationRepository } from '@/notification/notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway, private readonly notificationRepository: NotificationRepository) {}
  async sendPublicAnnouncement(body: PublicAnnouncementDto, userId: mongoose.Types.ObjectId): Promise<void> {
    await this.notificationRepository.createPublicAnnouncement(body, userId);
    this.notificationGateway.sendPublicAnnouncement(body);
  }
}
