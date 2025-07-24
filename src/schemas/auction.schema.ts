import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { Base } from '@/schemas/base.schema';
import { Team } from '@/schemas/team.schema';

@Schema()
export class Auction extends Base {
  @ApiProperty({ description: 'The name of the skill card being auctioned', enum: SkillCardEnum })
  @Prop({ required: true, type: String, enum: SkillCardEnum })
  skillCard: SkillCardEnum;

  @ApiProperty({ description: 'The team that wins the item' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
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
