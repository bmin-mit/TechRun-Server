import { ItemActionEnum } from '@common/enums/item-action.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';
import { Item } from '@schemas/item.schema';
import { Team } from '@schemas/team.schema';
import mongoose from 'mongoose';

@Schema()
export class ItemHistory extends Base {
  @ApiProperty({ description: 'The item associated with the change' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Item.name })
  item: Item;

  @ApiProperty({ description: 'The team associated with the item change' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  team: Team;

  @ApiProperty({ description: 'The action performed on the item', enum: ItemActionEnum })
  @Prop({ type: String, enum: ItemActionEnum, required: true })
  action: ItemActionEnum;

  @ApiProperty({ description: 'The objective team associated with the item change' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Team.name })
  objectiveTeam: Team;

  @ApiProperty({ description: 'The reason for the change' })
  @Prop({ required: true })
  reason: string;
}

export const ItemHistorySchema = SchemaFactory.createForClass(ItemHistory);
