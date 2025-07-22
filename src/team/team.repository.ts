import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTeamReqDto, OtherTeamsCoinsResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { CoinsHistory } from '@/schemas/coins-history.schema';
import { ItemHistory } from '@/schemas/item-history.schema';
import { Station } from '@/schemas/station.schema';
import { Team } from '@/schemas/team.schema';
import { User } from '@/schemas/user.schema';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(CoinsHistory.name) private readonly coinsHistoryModel: Model<CoinsHistory>,
    @InjectModel(ItemHistory.name) private readonly itemHistoryModel: Model<ItemHistory>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
  }

  async findTeamByCodename(codename: string): Promise<Team | null> {
    return await this.teamModel.findOne({ codename }).exec();
  }

  async findTeamById(teamId: string): Promise<Team | null> {
    return await this.teamModel.findById(teamId).exec();
  }

  async findAllTeams(): Promise<Team[]> {
    return await this.teamModel.find({}).sort({ coins: -1 }).exec();
  }

  async getTeamCoins(teamId: string): Promise<number | null> {
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      return null;
    }

    return team.coins;
  }

  async getTeamStations(teamId: string): Promise<Station[] | null> {
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      return null;
    }

    return team.stations;
  }

  async getTeamMembers(teamId: string): Promise<User[] | null> {
    return await this.userModel.find({ team: teamId }).exec();
  }

  async getTeamItems(teamId: string): Promise<{ itemId: string; quantity: number }[] | null> {
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      return null;
    }

    return team.items;
  }

  async updateTeamCoins(teamId: string, change: number, reason: string): Promise<Team | null> {
    await this.coinsHistoryModel.create({
      team: teamId,
      change,
      reason,
    });

    return await this.teamModel.findByIdAndUpdate(
      teamId,
      { $inc: { coins: change } },
      { new: true },
    ).exec();
  }

  async createTeam(teamData: CreateTeamReqDto): Promise<Team> {
    // eslint-disable-next-line new-cap
    const newTeam = new this.teamModel(teamData);
    return await newTeam.save();
  }

  async updateTeam(teamId: string, teamData: UpdateTeamReqDto): Promise<Team | null> {
    return await this.teamModel.findByIdAndUpdate(teamId, teamData, { new: true }).exec();
  }

  async deleteTeam(teamId: string): Promise<Team | null> {
    return await this.teamModel.findByIdAndDelete(teamId).exec();
  }

  async getOtherTeamsCoins(): Promise<OtherTeamsCoinsResDto[]> {
    const teams = await this.teamModel.find({}).exec();
    return teams.map(team => ({
      name: team.name,
      codename: team.codename,
      coins: team.coins,
    }));
  }

  async updateTeamItems(teamId: string, itemId: string, quantity: number, reason: string) {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      return null; // Team not found
    }

    await this.itemHistoryModel.create({
      team: teamId,
      item: itemId,
      action: quantity > 0 ? 'added' : 'removed',
      quantity: Math.abs(quantity),
      reason,
    });

    const itemIndex = team.items.findIndex(item => item.itemId === itemId);
    if (itemIndex !== -1) {
      // Item already exists in the team, update quantity
      team.items[itemIndex].quantity += quantity;
      if (team.items[itemIndex].quantity <= 0) {
        team.items.splice(itemIndex, 1); // Remove item if quantity is zero
      }
    }
    else if (quantity > 0) {
      // Item does not exist, add a new item
      team.items.push({ itemId, quantity });
    }

    return await team.save();
  }
}
