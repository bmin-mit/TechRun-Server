import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';
import { Team } from '@schemas/team.schema';
import mongoose from 'mongoose';

@Schema()
export class PointsHistory extends Base {
  @ApiProperty({ description: 'The team associated with the points change' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Team' })
  team: Team;

  @ApiProperty({ description: 'The difference in coins' })
  @Prop({ required: true })
  diff: number;

  @ApiProperty({ description: 'The reason for the points change' })
  @Prop({ required: true })
  reason: string;
}

export const PointsHistorySchema = SchemaFactory.createForClass(PointsHistory);
