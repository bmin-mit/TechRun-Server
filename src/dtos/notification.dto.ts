import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PublicAnnouncementDto {
  @ApiProperty({ description: 'The title of the public announcement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content of the public announcement' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
