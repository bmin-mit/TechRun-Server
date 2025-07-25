import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { StationDifficultyEnum } from '@/common/enums/station-difficulty.enum';
import { Base } from '@/schemas/base.schema';
import { StationGroup } from '@/schemas/station-group.schema';

@Schema()
export class Station extends Base {
  @ApiProperty({ description: 'The name of the station' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The codename of the station' })
  @Prop({ required: true, unique: true, index: true })
  codename: string;

  @ApiProperty({ description: 'The difficulty of the station', enum: StationDifficultyEnum })
  @Prop({ required: true, type: String, enum: StationDifficultyEnum, default: StationDifficultyEnum.EASY })
  difficulty: StationDifficultyEnum;

  @ApiProperty({ description: 'The station group of this station' })
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: StationGroup.name })
  stationGroup: StationGroup;

  @ApiProperty({ description: 'The station\'s 4-digit PIN code' })
  @Prop({ required: true })
  pin: string;
}

export const StationSchema = SchemaFactory.createForClass(Station);
