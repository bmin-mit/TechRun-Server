import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillCardActionEnum, SkillCardEnum } from '@/common/enums/skill-card.enum';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { CreateTeamReqDto, OtherTeamsCoinsResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { CoinsHistory } from '@/schemas/coins-history.schema';
import { SkillCardHistory } from '@/schemas/skill-card-history.schema';
import { Station } from '@/schemas/station.schema';
import { Team } from '@/schemas/team.schema';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(CoinsHistory.name) private readonly coinsHistoryModel: Model<CoinsHistory>,
    @InjectModel(SkillCardHistory.name) private readonly skillCardModel: Model<SkillCardHistory>,
    @InjectModel(SkillCardHistory.name) private readonly skillCardHistoryModel: Model<SkillCardHistory>,
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

  async updateTeamCoins(station: Station, teamUsername: string, diff: number, reason: string): Promise<Team | null> {
    const team = await this.findTeamByUsername(teamUsername);
    if (!team) {
      return null;
    }

    if (team.skillCardsUsing.includes(SkillCardEnum.NGOI_SAO_HI_VONG) && diff > 0 && station.stationGroup.codename === 'minigame-station') {
      // If the team is using the "Ngôi sao hy vọng" skill card, triple the coins
      diff *= 3;
      await this.teamModel.updateOne(team, { $set: { skillCardsUsing: team.skillCardsUsing.filter(card => card !== SkillCardEnum.NGOI_SAO_HI_VONG) } }).exec();
    }

    await this.coinsHistoryModel.create({
      station,
      team,
      diff,
      reason,
    });

    return await this.teamModel.findByIdAndUpdate(
      team,
      { $inc: { coins: diff } },
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
    })).filter(team => team.username !== 'admin'); // Exclude admin team
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

  async updateAdminPassword(adminPassword: string) {
    const team = await this.teamModel.findOne({ username: 'admin' }).exec();

    if (!team) {
      return await this.createAdmin(adminPassword);
    }

    team.password = adminPassword;
    return await team.save();
  }

  async addSkillCardToTeam(teamUsername: string, skillCard: SkillCardEnum) {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();
    if (!team) {
      return null; // Team not found
    }

    // Log the addition of the skill card
    await this.skillCardModel.create({
      team,
      skillCard,
      action: SkillCardActionEnum.ADDED,
    });

    team.skillCards.push(skillCard);

    return await team.save();
  }

  async getTeamSkillCardHistory(teamUsername: string): Promise<SkillCardHistory[]> {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();
    if (!team) {
      return []; // Team not found
    }
    return await this.skillCardModel.find({ team: team._id }).sort({ createdAt: -1 }).exec();
  }

  async getAllSkillCardHistory(): Promise<SkillCardHistory[]> {
    return await this.skillCardModel.find({}).sort({ createdAt: -1 }).exec();
  }

  async useSkillCard(teamId: string, skillCard: SkillCardEnum) {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      return null; // Team not found
    }

    if (!team.skillCards.includes(skillCard)) {
      return null; // Skill card isn't found in this team
    }

    if (skillCard === SkillCardEnum.DONG_BO) {
      // Use the previously used skill card
      const previousCard = (await this.skillCardHistoryModel
        .find({ team: team._id })
        .sort({ createdAt: -1 })
        .exec())[0];

      if (!previousCard) {
        return null; // No previous skill card found
      }

      // Remove the current skill card from the team
      team.skillCards = team.skillCards.filter(card => card !== skillCard);
      await team.save();

      // Log the usage of the previous skill card, and this card also
      await this.skillCardHistoryModel.create({
        team,
        skillCard,
        action: SkillCardActionEnum.USED,
      });

      // Return this for the client to render
      return await this.skillCardHistoryModel.create({
        team,
        skillCard: previousCard.skillCard,
        action: SkillCardActionEnum.USED,
      });
    }

    if (skillCard === SkillCardEnum.NGOI_SAO_HI_VONG) {
      team.skillCards = team.skillCards.filter(card => card !== skillCard);
      team.skillCardsUsing.push(skillCard);
      await team.save();
    }

    // Remove the skill card from the team
    team.skillCards = team.skillCards.filter(card => card !== skillCard);
    await team.save();

    // Log the usage of the skill card and return for the client to render
    await this.skillCardHistoryModel.create({
      team,
      skillCard,
      action: SkillCardActionEnum.USED,
    });
  }
}
