import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Station } from '@/schemas/station.schema';
import { Team } from '@/schemas/team.schema';

export class CreateTeamReqDto extends OmitType(Team, ['_id', 'createdAt', 'updatedAt', 'role'] as const) {}
export class UpdateTeamReqDto extends OmitType(Team, ['_id', 'createdAt', 'updatedAt', 'role'] as const) {}
export class OtherTeamsCoinsResDto {
  @ApiProperty({ description: 'The team name' })
  name: string;

  @ApiProperty({ description: 'The team username' })
  username: string;

  @ApiProperty({ description: 'The number of coins the team has' })
  coins: number;
}
export class MeResDto {
  @ApiProperty({ description: 'The team\'s ID' })
  _id: string;

  @ApiProperty({ description: 'The team\'s name' })
  name: string;

  @ApiProperty({ description: 'The team\'s username for logging in and querying' })
  username: string;

  @ApiProperty({ description: 'The team\'s number of coins' })
  coins: number;

  @ApiProperty({ description: 'The team\'s unlocked "Năng lực số" indices array' })
  unlockedPuzzles: Array<Station>;

  @ApiProperty({ description: 'The team\'s skill cards' })
  skillCards: Array<string>;
}
