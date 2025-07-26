import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Base } from '@/schemas/base.schema';
import { Station } from '@/schemas/station.schema';
import { Team } from '@/schemas/team.schema';

@Schema()
export class CoinsHistory extends Base {
  @ApiProperty({ description: 'The station where staff changed the coins' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Station.name })
  station: Station;

  @ApiProperty({ description: 'The team associated with the coins change' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team: Team;

  @ApiProperty({ description: 'The difference in coins' })
  @Prop({ required: true })
  diff: number;

  @ApiProperty({ description: 'The reason for the coins change' })
  @Prop({ required: true })
  reason: string;
}

export const CoinsHistorySchema = SchemaFactory.createForClass(CoinsHistory);
