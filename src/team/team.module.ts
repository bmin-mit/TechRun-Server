import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionModule } from '@/auction/auction.module';
import { CoinsHistory, CoinsHistorySchema } from '@/schemas/coins-history.schema';
import { Team, TeamSchema } from '@/schemas/team.schema';
import { TeamRepository } from '@/team/team.repository';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Team.name, schema: TeamSchema },
        { name: CoinsHistory.name, schema: CoinsHistorySchema },
      ],
    ),
    forwardRef(() => AuctionModule),
  ],
  providers: [TeamService, TeamRepository],
  controllers: [TeamController],
  exports: [TeamRepository],
})
export class TeamModule {}
