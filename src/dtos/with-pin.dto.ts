import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WithPinDto {
  @ApiProperty({ description: 'The station\'s codename' })
  @IsString()
  @IsNotEmpty()
  stationCodename: string;

  @ApiProperty({ description: 'The station\'s PIN code' })
  @IsString()
  @IsNotEmpty()
  pin: string;
}
