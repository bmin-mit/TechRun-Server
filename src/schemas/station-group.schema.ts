import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@/schemas/base.schema';

export class StationGroup extends Base {
  @ApiProperty({ description: 'The name of the station group' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The codename of the station group' })
  @Prop({ required: true, unique: true, index: true })
  codename: string;
}

export const StationGroupSchema = SchemaFactory.createForClass(StationGroup);
