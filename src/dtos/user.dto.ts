import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '@/schemas/user.schema';

export class CreateUserWithoutRoleReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt', 'role', 'team'] as const) {
  @ApiProperty({ description: 'Is the user the leader of the team' })
  isLeader?: boolean;

  @ApiProperty({ description: 'The team ID to which the user belongs' })
  team?: string;
}

export class CreateUserReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt', 'team'] as const) {
  @ApiProperty({ description: 'The team ID to which the user belongs' })
  team?: string;
}

export class UpdateUserReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt', 'password', 'role', 'team'] as const) {
  @ApiProperty({ description: 'The team ID to which the user belongs' })
  team?: string;
}

export class UpdateUserPasswordDto {
  @ApiProperty({ description: 'Old password of the user' })
  oldPassword: string;

  @ApiProperty({ description: 'New password of the user' })
  newPassword: string;
}

export class AdminUpdateUserPasswordReqDto {
  @ApiProperty({ description: 'New password of the user' })
  newPassword: string;
}
