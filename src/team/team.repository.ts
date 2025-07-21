import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Team } from '@schemas/team.schema';
import { User } from '@schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findTeamByName(teamName: string): Promise<Team | null> {
    return await this.teamModel.findOne({ name: teamName }).exec();
  }

  async getTeamCoins(userId: string) {
    const user = await this.userModel.findById(userId).populate('team').exec();

    if (!user || !user.team) {
      return 0; // or throw an error if preferred
    }

    return user.team.coins;
  }

  async updateTeamCoins(teamId: string, change: number) {
    return await this.teamModel.findByIdAndUpdate(
      teamId,
      { $inc: { coins: change } },
      { new: true },
    ).exec();
  }
}
