import { CreateStationReqDto, UpdateStationReqDto } from '@dtos/station.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StationRepository } from '@/station/station.repository';

@Injectable()
export class StationService {
  constructor(private readonly stationRepository: StationRepository) {}

  async findStationByName(stationName: string) {
    return await this.stationRepository.findStationByName(stationName);
  }

  async findStationById(stationId: string) {
    return await this.stationRepository.findStationById(stationId);
  }

  async findAllStations() {
    return await this.stationRepository.findAllStations();
  }

  async createNewStation(stationData: CreateStationReqDto) {
    if (await this.findStationByName(stationData.name)) {
      throw new ConflictException('Station with this name already exists');
    }
    return await this.stationRepository.createNewStation(stationData);
  }

  async updateStation(stationId: string, updateData: UpdateStationReqDto) {
    if (await this.findStationById(stationId) === null) {
      throw new NotFoundException('Station not found');
    }
    return await this.stationRepository.updateStation(stationId, updateData);
  }

  async deleteStation(stationId: string) {
    if (await this.findStationById(stationId) === null) {
      throw new NotFoundException('Station not found');
    }

    return await this.stationRepository.deleteStation(stationId);
  }
}
