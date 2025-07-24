import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { Auction } from '@/schemas/auction.schema';
import { Base } from '@/schemas/base.schema';
import { Team } from '@/schemas/team.schema';

// This schema is similar to AuctionHistorySchema, but it is used for the
// current auction status to simplify the logic.
export class AuctionStatus extends Base {
  @ApiProperty({ description: 'The auction' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Auction.name })
  auction: Auction;

  @ApiProperty({ description: 'The team' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team: Team;

  @ApiProperty({ description: 'The auctioned price' })
  @Prop({ required: true })
  auctionedPrice: number;
}

export const AuctionStatusSchema = SchemaFactory.createForClass(AuctionStatus);
