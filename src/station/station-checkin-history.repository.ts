import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StationCheckinHistory } from '@/schemas/station-checkin-history.schema';
import { Station } from '@/schemas/station.schema';

@Injectable()
export class StationCheckinHistoryRepository {
  constructor(@InjectModel(StationCheckinHistory.name) private readonly stationCheckinHistoryModel: Model<StationCheckinHistory>) {
  }

  async findVisitedStationsByTeam(teamUsername: string): Promise<StationCheckinHistory[]> {
    return await this.stationCheckinHistoryModel.find({ team: { username: teamUsername } }).sort({ createdAt: -1 }).exec();
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
