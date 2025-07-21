import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';
import { Station } from '@schemas/station.schema';
import mongoose from 'mongoose';

@Schema()
export class Team extends Base {
  @ApiProperty({ description: 'The team\'s name' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'The team\'s description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'The team\'s number of coins' })
  @Prop({ required: true, default: 0 })
  coins: number;

  @ApiProperty({ description: 'The team\'s items' })
  @Prop({ type: [{ itemId: String, quantity: Number }], default: [] })
  items: Array<{ itemId: string; quantity: number }>;

  @ApiProperty({ description: 'The team\'s next station ID' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: Station.name })
  nextStation?: Station;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
