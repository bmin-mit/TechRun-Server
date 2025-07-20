import { Module } from '@nestjs/common';
import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  providers: [StationService],
  controllers: [StationController],
})
export class StationModule {}
