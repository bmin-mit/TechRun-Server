import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Team } from '@/schemas/team.schema';

export class CreateTeamReqDto extends OmitType(Team, ['_id', 'createdAt', 'updatedAt'] as const) {}
export class UpdateTeamReqDto extends OmitType(Team, ['_id', 'createdAt', 'updatedAt'] as const) {}
export class OtherTeamsCoinsResDto {
  @ApiProperty({ description: 'The team name' })
  name: string;

  @ApiProperty({ description: 'The team username' })
  username: string;

  @ApiProperty({ description: 'The number of coins the team has' })
  coins: number;
}
