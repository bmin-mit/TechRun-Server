import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { Base } from '@/schemas/base.schema';

@Schema()
export class Team extends Base {
  @ApiProperty({ description: 'The team\'s name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The team\'s username for logging in and querying' })
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @ApiProperty({ description: 'The team\'s password for logging in' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'The team\'s role' })
  @Prop({ required: true, type: String, enum: UserRoleEnum, default: UserRoleEnum.PLAYER })
  role: UserRoleEnum;

  @ApiProperty({ description: 'The team\'s number of coins' })
  @Prop({ required: true, default: 0 })
  coins: number;

  @ApiProperty({ description: 'The team\'s unlocked "Năng lực số" indices array' })
  @Prop({ type: [Number], default: [] })
  unlockedPuzzles: Array<number>;

  @ApiProperty({ description: 'The team\'s skill cards' })
  @Prop({ type: [String], default: [], enum: SkillCardEnum })
  skillCards: Array<SkillCardEnum>;

  @Prop({ type: [String], default: [], enum: SkillCardEnum })
  usingSkillCards: Array<SkillCardEnum>;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
