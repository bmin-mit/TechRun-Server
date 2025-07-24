import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionTickService } from '@/auction/auction-tick.service';
import { AuctionRepository } from '@/auction/auction.repository';
import { AuctionHistory, AuctionHistorySchema } from '@/schemas/auction-history.schema';
import { Auction, AuctionSchema } from '@/schemas/auction.schema';
import { TeamModule } from '@/team/team.module';
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
    TeamModule,
  ],
  providers: [AuctionService, AuctionRepository, AuctionTickService],
  controllers: [AuctionController],
  exports: [AuctionRepository, AuctionService],
})
export class AuctionModule {}
