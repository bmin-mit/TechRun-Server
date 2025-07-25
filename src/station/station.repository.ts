import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Skip } from '@/schemas/skip.schema';
import { Station } from '@/schemas/station.schema';

@Injectable()
export class StationRepository {
  constructor(
    @InjectModel(Station.name) private readonly stationModel: Model<Station>,
    @InjectModel(Skip.name) private readonly skipModel: Model<Skip>,
  ) {}

  async findStationByCodename(stationCodename: string): Promise<Station | null> {
    return await this.stationModel.findOne({ codename: stationCodename }).exec();
  }

  async findStationById(stationId: string): Promise<Station | null> {
    if (!mongoose.Types.ObjectId.isValid(stationId))
      throw new NotFoundException('Invalid station ID');
    return await this.stationModel.findById(stationId).exec();
  }

  async findAllStations(): Promise<Station[]> {
    return await this.stationModel.find({}).sort({ name: 1 }).exec();
  }

  async createNewStation(stationData: Partial<Station>): Promise<Station> {
    // eslint-disable-next-line new-cap
    const newStation = new this.stationModel(stationData);
    return await newStation.save();
  }

  async updateStation(stationId: string, updateData: Partial<Station>): Promise<Station | null> {
    return await this.stationModel.findByIdAndUpdate(
      stationId,
      updateData,
      { new: true },
    ).exec();
  }

  async deleteStation(stationId: string): Promise<Station | null> {
    return await this.stationModel.findByIdAndDelete(stationId).exec();
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async getUnskipPrice(stationId: string): Promise<number> {
    // TODO: Implement logic to calculate the unskip price based on station properties or other criteria.
    return 0;
  }

  async skip(teamId: string, stationGroupId: string): Promise<Skip> {
    // eslint-disable-next-line new-cap
    const skip = new this.skipModel({
      team: teamId,
      stationGroup: stationGroupId,
    });
    return skip.save();
  }

  async unskip(teamId: string, stationGroupId: string): Promise<void> {
    await this.skipModel.findOneAndDelete({ team: teamId, stationGroup: stationGroupId });
  }

  isSkipped(teamId: string, stationId: string) {
    return this.skipModel.exists({
      team: teamId,
      stationGroup: stationId,
    }) !== null;
  }
}
