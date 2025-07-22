import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationRepository } from '@/notification/notification.repository';
import { NotificationHistory, NotificationHistorySchema } from '@/schemas/notification-history.schema';
import { UserModule } from '@/user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NotificationHistory.name, schema: NotificationHistorySchema }]),
    UserModule,
  ],
  providers: [NotificationService, NotificationGateway, NotificationRepository],
  controllers: [NotificationController],
  exports: [NotificationRepository, NotificationService],
})
export class NotificationModule {}
