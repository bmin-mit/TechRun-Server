import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { StationPositionEnum } from '@/common/enums/station-position.enum';
import { Base } from '@/schemas/base.schema';

@Schema()
export class StationGroup extends Base {
  @ApiProperty({ description: 'The name of the station group' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The codename of the station group' })
  @Prop({ required: true, unique: true, index: true })
  codename: string;

  @ApiProperty({ description: 'The position of the station group', type: String, enum: StationPositionEnum })
  @Prop({ required: true })
  position: StationPositionEnum;
}

export const StationGroupSchema = SchemaFactory.createForClass(StationGroup);
