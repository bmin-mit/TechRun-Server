import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';
import { Item } from '@schemas/item.schema';
import { Team } from '@schemas/team.schema';
import mongoose from 'mongoose';

@Schema()
export class Auction extends Base {
  @ApiProperty({ description: 'The item being auctioned' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Item' })
  item: Item;

  @ApiProperty({ description: 'The team that wins the item' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Team' })
  winningTeam?: Team;

  @ApiProperty({ description: 'The auction\'s winning price' })
  @Prop({ required: false })
  winningPrice?: number;

  @ApiProperty({ description: 'The auction\'s end time' })
  @Prop({ required: true })
  endTime: Date;

  @ApiProperty({ description: 'The auction\'s duration in seconds' })
  @Prop({ required: true })
  durationInSeconds: number;
}

export const AuctionSchema = SchemaFactory.createForClass(Auction);
