import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Auction } from '@schemas/auction.schema';
import { Base } from '@schemas/base.schema';
import { Team } from '@schemas/team.schema';
import mongoose from 'mongoose';

@Schema()
export class AuctionHistory extends Base {
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
