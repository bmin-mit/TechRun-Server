import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '@schemas/user.schema';

export class CreateUserWithoutRoleReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt', 'role'] as const) {
  @ApiProperty({ description: 'Is the user the leader of the team' })
  isLeader?: boolean;
}
export class CreateUserReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt'] as const) {}
export class UpdateUserReqDto extends OmitType(User, ['_id', 'createdAt', 'updatedAt', 'password', 'role'] as const) {}
export class UpdateUserPasswordDto {
  @ApiProperty({ description: 'Old password of the user' })
  oldPassword: string;

  @ApiProperty({ description: 'New password of the user' })
  newPassword: string;
}

export class AdminChangeUserPasswordReqDto {
  @ApiProperty({ description: 'New password of the user' })
  newPassword: string;
}
