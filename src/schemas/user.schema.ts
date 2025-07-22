import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { Base } from '@/schemas/base.schema';
import { Team } from '@/schemas/team.schema';

@Schema()
export class User extends Base {
  @ApiProperty({ description: 'The username of the user' })
  @Prop({ required: true, index: true, unique: true })
  username: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Prop({ required: true })
  fullName: string;

  @ApiProperty({ description: 'The password of the user' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'The role of the user', enum: UserRoleEnum })
  @Prop({ required: true, type: String, enum: UserRoleEnum, default: UserRoleEnum.MEMBER })
  role: UserRoleEnum;

  @ApiProperty({ description: 'The team of the user, only be null if admin' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team?: Team;
}

export const UserSchema = SchemaFactory.createForClass(User);
