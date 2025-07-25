import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Base } from '@/schemas/base.schema';
import { StationGroup } from '@/schemas/station-group.schema';
import { Team } from '@/schemas/team.schema';

export class Skip extends Base {
  @ApiProperty({ description: 'The station group to skip' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: StationGroup.name })
  stationGroup: StationGroup;

  @ApiProperty({ description: 'The team that skipped' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team: Team;
}

export const SkipSchema = SchemaFactory.createForClass(Skip);
