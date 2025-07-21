import { StationDifficultyEnum } from '@common/enums/station-difficulty.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from '@schemas/base.schema';

@Schema()
export class Station extends Base {
  @ApiProperty({ description: 'The name of the station' })
  @Prop({ required: true, index: true, unique: true })
  name: string;

  @ApiProperty({ description: 'The description of the station' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'The geolocation of the station' })
  @Prop({ required: true })
  location: string;

  @ApiProperty({ description: 'The difficulty of the station', enum: StationDifficultyEnum })
  @Prop({ required: true, type: String, enum: StationDifficultyEnum, default: StationDifficultyEnum.EASY })
  difficulty: StationDifficultyEnum;
}

export const StationSchema = SchemaFactory.createForClass(Station);
