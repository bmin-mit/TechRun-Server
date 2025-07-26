import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StationCheckinHistory } from '@/schemas/station-checkin-history.schema';
import { Station } from '@/schemas/station.schema';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class StationCheckinHistoryRepository {
  constructor(
    @InjectModel(StationCheckinHistory.name) private readonly stationCheckinHistoryModel: Model<StationCheckinHistory>,
    private readonly teamRepository: TeamRepository,
  ) {
  }

  async findVisitedStationsByTeam(teamUsername: string): Promise<StationCheckinHistory[]> {
    const team = await this.teamRepository.findTeamByUsername(teamUsername);
    if (!team) {
      throw new Error(`Team with username "${teamUsername}" not found`);
    }

    return await this.stationCheckinHistoryModel
      .find({ team: team._id })
      .populate('station')
      .populate('team')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createCheckinHistory(station: Station, teamId: string) {
    // eslint-disable-next-line new-cap
    const newCheckin = new this.stationCheckinHistoryModel({
      station,
      team: teamId,
    });

    return await newCheckin.save();
  }
}
