import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionModule } from '@/auction/auction.module';
import { CoinsHistory, CoinsHistorySchema } from '@/schemas/coins-history.schema';
import { SkillCardHistory, SkillCardHistorySchema } from '@/schemas/skill-card-history.schema';
import { Team, TeamSchema } from '@/schemas/team.schema';
import { StationModule } from '@/station/station.module';
import { TeamRepository } from '@/team/team.repository';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Team.name, schema: TeamSchema },
        { name: CoinsHistory.name, schema: CoinsHistorySchema },
        { name: SkillCardHistory.name, schema: SkillCardHistorySchema },
      ],
    ),
    forwardRef(() => AuctionModule),
    forwardRef(() => StationModule),
  ],
  providers: [TeamService, TeamRepository],
  controllers: [TeamController],
  exports: [TeamRepository],
})
export class TeamModule {}
