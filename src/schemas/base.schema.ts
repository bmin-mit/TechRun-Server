import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

@Schema()
export class Base {
  @ApiProperty({ description: 'The unique identifier of the document' })
  _id?: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'The date when the document was created' })
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @ApiProperty({ description: 'The date when the document was last updated' })
  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
}
