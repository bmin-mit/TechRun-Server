import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { NotificationTypeEnum } from '@/common/enums/notification-type.enum';
import { Base } from '@/schemas/base.schema';
import { Team } from '@/schemas/team.schema';
import { User } from '@/schemas/user.schema';

@Schema()
export class NotificationHistory extends Base {
  @ApiProperty({ description: 'The title of the notification' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The content of the notification' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'The user who created the notification, only be null if sent from the server' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy?: User;

  @ApiProperty({ description: 'The type of the notification' })
  @Prop({ required: true, default: NotificationTypeEnum.PUBLIC_ANNOUNCEMENT, enum: NotificationTypeEnum, type: String })
  type: NotificationTypeEnum;

  @ApiProperty({ description: 'The team to which the notification is sent, if not public' })
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  toTeam?: Team;
}

export const NotificationHistorySchema = SchemaFactory.createForClass(NotificationHistory);
