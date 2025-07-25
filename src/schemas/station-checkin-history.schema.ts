import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Base } from '@/schemas/base.schema';
import { Station } from '@/schemas/station.schema';
import { Team } from '@/schemas/team.schema';

@Schema()
export class StationCheckinHistory extends Base {
  @ApiProperty({ description: 'The checked-in station' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Station.name })
  station: Station;

  @ApiProperty({ description: 'The team that checked in' })
  @Prop({ required: true, type: mongoose.Schema.Types.String, ref: Team.name })
  team: Team;
}

export const StationCheckinHistorySchema = SchemaFactory.createForClass(StationCheckinHistory);
