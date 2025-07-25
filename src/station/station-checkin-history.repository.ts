import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StationCheckinHistory } from '@/schemas/station-checkin-history.schema';

@Injectable()
export class StationCheckinHistoryRepository {
  constructor(@InjectModel(StationCheckinHistory.name) private readonly stationCheckinHistoryModel: Model<StationCheckinHistory>) {
  }

  async findVisitedStationsByTeam(teamId: string): Promise<StationCheckinHistory[]> {
    return await this.stationCheckinHistoryModel.find({ team: teamId }).sort({ createdAt: -1 }).exec();
  }

  async createCheckinHistory(stationId: string, teamUsername: string) {
    // eslint-disable-next-line new-cap
    const newCheckin = new this.stationCheckinHistoryModel({
      station: stationId,
      team: teamUsername,
    });

    return await newCheckin.save();
  }
}
