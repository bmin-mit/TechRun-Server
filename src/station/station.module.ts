import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Station, StationSchema } from '@schemas/station.schema';
import { StationRepository } from '@/station/station.repository';
import { UserModule } from '@/user/user.module';
import { StationController } from './station.controller';
import { StationService } from './station.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Station.name, schema: StationSchema }]), UserModule],
  providers: [StationService, StationRepository],
  controllers: [StationController],
  exports: [StationRepository],
})
export class StationModule {}
