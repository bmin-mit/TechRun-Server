import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Skip, SkipSchema } from '@/schemas/skip.schema';
import { StationCheckinHistory, StationCheckinHistorySchema } from '@/schemas/station-checkin-history.schema';
import { StationGroup, StationGroupSchema } from '@/schemas/station-group.schema';
import { Station, StationSchema } from '@/schemas/station.schema';
import { StationCheckinHistoryRepository } from '@/station/station-checkin-history.repository';
import { StationRepository } from '@/station/station.repository';
import { TeamModule } from '@/team/team.module';
import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Station.name, schema: StationSchema },
        { name: StationCheckinHistory.name, schema: StationCheckinHistorySchema },
        { name: StationGroup.name, schema: StationGroupSchema },
        { name: Skip.name, schema: SkipSchema },
      ],
    ),
    forwardRef(() => TeamModule),
  ],
  providers: [StationService, StationRepository, StationCheckinHistoryRepository],
  controllers: [StationController],
  exports: [StationRepository, StationService, MongooseModule],
})
export class StationModule {}
