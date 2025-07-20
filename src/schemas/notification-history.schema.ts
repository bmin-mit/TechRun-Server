import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';
import { Team } from '@schemas/team.schema';
import { User } from '@schemas/user.schema';
import mongoose from 'mongoose';

@Schema()
export class NotificationHistory extends Base {
  @ApiProperty({ description: 'The title of the notification' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The content of the notification' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'The user who created the notification' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'Is this notification public?' })
  @Prop({ required: true, default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'The team to which the notification is sent, if not public' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'Team' })
  toTeam?: Team;
}

export const NotificationHistorySchema = SchemaFactory.createForClass(NotificationHistory);
