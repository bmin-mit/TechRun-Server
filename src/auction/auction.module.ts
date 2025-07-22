import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionTickService } from '@/auction/auction-tick.service';
import { AuctionRepository } from '@/auction/auction.repository';
import { ItemModule } from '@/item/item.module';
import { NotificationModule } from '@/notification/notification.module';
import { AuctionHistory, AuctionHistorySchema } from '@/schemas/auction-history.schema';
import { Auction, AuctionSchema } from '@/schemas/auction.schema';
import { UserModule } from '@/user/user.module';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Auction.name,
        schema: AuctionSchema,
      },
      {
        name: AuctionHistory.name,
        schema: AuctionHistorySchema,
      },
    ]),
    forwardRef(() => ItemModule),
    NotificationModule,
    UserModule,
  ],
  providers: [AuctionService, AuctionRepository, AuctionTickService],
  controllers: [AuctionController],
  exports: [AuctionRepository, AuctionService],
})
export class AuctionModule {}
