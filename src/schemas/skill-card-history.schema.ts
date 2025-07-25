import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { SkillCardActionEnum, SkillCardEnum } from '@/common/enums/skill-card.enum';
import { Base } from '@/schemas/base.schema';
import { Team } from '@/schemas/team.schema';

@Schema()
export class SkillCardHistory extends Base {
  @ApiProperty({ description: 'The team\'s ID' })
  @Prop({ required: true, index: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team: Team;

  @ApiProperty({ description: 'The skill card', type: String, enum: SkillCardEnum })
  skillCard: SkillCardEnum;

  @ApiProperty({ description: 'Action' })
  @Prop({ required: true, type: String, enum: SkillCardActionEnum })
  action: SkillCardActionEnum;
}

export const SkillCardHistorySchema = SchemaFactory.createForClass(SkillCardHistory);
