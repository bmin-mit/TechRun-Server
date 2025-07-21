import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from '@schemas/team.schema';
import { User, UserSchema } from '@schemas/user.schema';
import { TeamRepository } from '@/team/team.repository';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Team.name, schema: TeamSchema },
        { name: User.name, schema: UserSchema },
      ],
    ),
  ],
  providers: [TeamService, TeamRepository],
  controllers: [TeamController],
  exports: [TeamRepository],
})
export class TeamModule {}
