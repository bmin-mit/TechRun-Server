import { ItemTypeEnum } from '@common/enums/item-type.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';

@Schema()
export class Item extends Base {
  @ApiProperty({ description: 'The name of the item' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The description of the item' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'The URL of the item\'s image' })
  @Prop({ required: true })
  imageUrl: string;

  @ApiProperty({ description: 'The type of the item', enum: ItemTypeEnum })
  @Prop({ type: String, enum: ItemTypeEnum, required: true })
  type: ItemTypeEnum;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
