import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { CreateTeamReqDto, OtherTeamsCoinsResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { CoinsHistory } from '@/schemas/coins-history.schema';
import { Team } from '@/schemas/team.schema';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(CoinsHistory.name) private readonly coinsHistoryModel: Model<CoinsHistory>,
  ) {
  }

  async findTeamByUsername(codename: string): Promise<Team | null> {
    return await this.teamModel.findOne({ username: codename }).exec();
  }

  async findTeamById(teamId: string): Promise<Team | null> {
    return await this.teamModel.findById(teamId).exec();
  }

  async findAllTeams(): Promise<Team[]> {
    return await this.teamModel.find({}).sort({ coins: -1 }).exec();
  }

  async getTeamCoins(teamUsername: string): Promise<number | null> {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();

    if (!team) {
      return null;
    }

    return team.coins;
  }

  async getTeamUnlockedPuzzles(teamUsername: string): Promise<number[] | null> {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();

    if (!team) {
      return null;
    }

    return team.unlockedPuzzles;
  }

  async updateTeamCoins(teamUsername: string, change: number, reason: string): Promise<Team | null> {
    const team = await this.findTeamByUsername(teamUsername);
    if (!team) {
      return null;
    }

    await this.coinsHistoryModel.create({
      team,
      change,
      reason,
    });

    return await this.teamModel.findByIdAndUpdate(
      team,
      { $inc: { coins: change } },
      { new: true },
    ).exec();
  }

  async createTeam(teamData: CreateTeamReqDto): Promise<Team> {
    // eslint-disable-next-line new-cap
    const newTeam = new this.teamModel({ ...teamData, role: UserRoleEnum.PLAYER });
    return await newTeam.save();
  }

  async updateTeam(teamUsername: string, teamData: UpdateTeamReqDto): Promise<Team | null> {
    return await this.teamModel.findByIdAndUpdate(teamUsername, teamData, { new: true }).exec();
  }

  async deleteTeam(teamUsername: string): Promise<Team | null> {
    return await this.teamModel.findByIdAndDelete(teamUsername).exec();
  }

  async getOtherTeamsCoins(): Promise<OtherTeamsCoinsResDto[]> {
    const teams = await this.teamModel.find({}).exec();
    return teams.map(team => ({
      name: team.name,
      username: team.username,
      coins: team.coins,
    }));
  }

  async unlockPuzzle(teamUsername: string, unlockedIndex: number) {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();
    if (!team) {
      return null; // Team not found
    }

    if (!team.unlockedPuzzles.includes(unlockedIndex)) {
      team.unlockedPuzzles.push(unlockedIndex);
    }

    return await team.save();
  }

  async createAdmin(adminPassword: string) {
    // eslint-disable-next-line new-cap
    const team = new this.teamModel({
      username: 'admin',
      name: 'Admin',
      password: adminPassword,
      role: UserRoleEnum.ADMIN,
    });

    return await team.save();
  }
}
