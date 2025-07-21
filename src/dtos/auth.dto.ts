import { UserRoleEnum } from '@common/enums/user-role.enum';
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

export class SignUpReqDto {
  @ApiProperty({ description: 'Username for sign-up' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Team ID of the user' })
  @IsString()
  teamId?: string;

  @ApiProperty({ description: 'Role of the user', enum: UserRoleEnum })
  role?: UserRoleEnum;

  @ApiProperty({ description: 'Password for sign-up' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
