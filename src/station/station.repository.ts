import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Station } from '@/schemas/station.schema';

@Injectable()
export class StationRepository {
  constructor(
    @InjectModel(Station.name) private readonly stationModel: Model<Station>,
  ) {}

  async findStationByName(stationName: string): Promise<Station | null> {
    return await this.stationModel.findOne({ name: stationName }).exec();
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
}
