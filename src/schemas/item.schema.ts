import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ItemTypeEnum } from '@/common/enums/item-type.enum';
import { Base } from '@/schemas/base.schema';

@Schema()
export class Item extends Base {
  @ApiProperty({ description: 'The name of the item for displaying to the users' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The description of the item' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'The item internal codename for querying' })
  @Prop({ required: true, unique: true, index: true })
  codename: string;

  @ApiProperty({ description: 'The Base64 encoded form of the item\'s image' })
  @Prop({ required: false })
  imageBase64?: string;

  @ApiProperty({ description: 'The type of the item', enum: ItemTypeEnum })
  @Prop({ type: String, enum: ItemTypeEnum, required: true })
  type: ItemTypeEnum;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
