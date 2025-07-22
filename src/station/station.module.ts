import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StationCheckinHistory, StationCheckinHistorySchema } from '@/schemas/station-checkin-history.schema';
import { Station, StationSchema } from '@/schemas/station.schema';
import { StationCheckinHistoryRepository } from '@/station/station-checkin-history.repository';
import { StationRepository } from '@/station/station.repository';
import { TeamModule } from '@/team/team.module';
import { UserModule } from '@/user/user.module';
import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Station.name, schema: StationSchema },
        { name: StationCheckinHistory.name, schema: StationCheckinHistorySchema },
      ],
    ),
    UserModule,
    TeamModule,
  ],
  providers: [StationService, StationRepository, StationCheckinHistoryRepository],
  controllers: [StationController],
  exports: [StationRepository],
})
export class StationModule {}
