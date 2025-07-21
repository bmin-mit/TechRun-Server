import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInReqDto {
  @ApiProperty({ description: 'Username for sign-in' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password for sign-in' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignInResDto {
  @ApiProperty({ description: 'Access token for authenticated user' })
  accessToken: string;
}
