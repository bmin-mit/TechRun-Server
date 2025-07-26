import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
    @InjectModel(Station.name) private readonly stationModel: Model<Station>,
    @InjectModel(CoinsHistory.name) private readonly coinsHistoryModel: Model<CoinsHistory>,
    @InjectModel(SkillCardHistory.name) private readonly skillCardModel: Model<SkillCardHistory>,
    @InjectModel(SkillCardHistory.name) private readonly skillCardHistoryModel: Model<SkillCardHistory>,
  ) {
  }

  async findTeamByUsername(codename: string): Promise<Team | null> {
    return await this.teamModel.findOne({ username: codename }).populate('unlockedPuzzles').exec();
  }

  async findTeamById(teamId: string): Promise<Team | null> {
    return await this.teamModel.findById(teamId).populate('unlockedPuzzles').exec();
  }

  async findAllTeams() {
    return await this.teamModel.find({ role: UserRoleEnum.PLAYER }).populate('unlockedPuzzles').sort({ coins: -1 }).exec();
  }

  async getTeamCoins(teamUsername: string): Promise<number | null> {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();

    if (!team) {
      return null;
    }

    return team.coins;
  }

  async getTeamUnlockedPuzzles(teamUsername: string): Promise<Station[] | null> {
    const team = await this.teamModel.findOne({ username: teamUsername }).exec();

    if (!team) {
      return null;
    }

    return team.unlockedPuzzles;
  }

  async updateTeamCoins(stationCodename: string, teamUsername: string, diff: number, reason: string): Promise<Team | null> {
    const team = await this.findTeamByUsername(teamUsername);
    const station = await this.stationModel.findOne({ codename: stationCodename }).exec();
    if (!team) {
      return null;
    }

    if (station!.stationGroup.codename === 'minigame-station') {
      if (team.usingSkillCards.includes(SkillCardEnum.NGOI_SAO_HI_VONG)) {
        diff = diff > 0 ? diff * 3 : diff; // Triple the coins
        await this.removeUsingSkillCard(team._id!.toString(), SkillCardEnum.NGOI_SAO_HI_VONG);
      }
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

  async updateTeam(teamId: string, teamData: UpdateTeamReqDto): Promise<Team | null> {
    return await this.teamModel.findByIdAndUpdate(teamId, teamData, { new: true }).exec();
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

  async unlockPuzzle(teamUsername: string, stationCodename: string) {
    const team = await this.teamModel.findOne({ username: teamUsername }).populate('unlockedPuzzles').exec();
    if (!team) {
      return null; // Team not found
    }

    const station = await this.stationModel.findOne({ codename: stationCodename }).exec();
    if (!stationCodename) {
      return null; // Station not found
    }
    const stationId = station!._id!.toString();

    if (!team.unlockedPuzzles.some(puzzle => puzzle._id!.toString() === stationId)) {
      // @ts-expect-error Mongoose will handle the ObjectId conversion
      team.unlockedPuzzles.push({ _id: new mongoose.Types.ObjectId(stationId) });
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

      return await this.addSkillCardToTeam(team.username, previousCard.skillCard);
    }

    if (skillCard === SkillCardEnum.NGOI_SAO_HI_VONG) {
      team.usingSkillCards.push(skillCard);
    }

    if (skillCard === SkillCardEnum.HOI_SINH) {
      team.usingSkillCards.push(skillCard);
    }

    if (skillCard === SkillCardEnum.VUOT_TRAM_PHU) {
      team.usingSkillCards.push(skillCard);
    }

    // Remove the skill card from the team
    team.skillCards = team.skillCards.filter(card => card !== skillCard);
    await team.save();

    // Log the usage of the skill card and return for the client to render
    return await this.skillCardHistoryModel.create({
      team,
      skillCard,
      action: SkillCardActionEnum.USED,
    });
  }

  async removeUsingSkillCard(teamId: string, skillCard: SkillCardEnum) {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      return null; // Team not found
    }

    if (!team.usingSkillCards.includes(skillCard)) {
      return null; // Skill card isn't being used by this team
    }

    team.usingSkillCards = team.usingSkillCards.filter(card => card !== skillCard);
    await team.save();

    return team;
  }
}
