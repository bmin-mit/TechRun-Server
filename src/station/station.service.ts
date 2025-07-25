import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StationDifficultyEnum } from '@/common/enums/station-difficulty.enum';
import { CreateStationReqDto, UpdateStationReqDto } from '@/dtos/station.dto';
import { StationCheckinHistoryRepository } from '@/station/station-checkin-history.repository';
import { StationRepository } from '@/station/station.repository';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class StationService {
  constructor(
    private readonly stationRepository: StationRepository,
    private readonly stationCheckinHistoryRepository: StationCheckinHistoryRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

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

  async visitStation(stationId: string, teamId: string) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    if (!(await this.canTeamVisitStation(stationId, teamId))) {
      throw new ConflictException('Team cannot visit this station');
    }

    const teamUsername = (await this.teamRepository.findTeamById(teamId))!.username;
    const station = await this.findStationById(stationId);
    const price = await this.getVisitPrice(stationId, teamUsername);

    await this.teamRepository.updateTeamCoins(teamUsername, -price, `Visiting station ${station!.name}`);
    return await this.stationCheckinHistoryRepository.createCheckinHistory(stationId, teamUsername);
  }

  async canTeamVisitStation(stationId: string, teamId: string) {
    const team = await this.teamRepository.findTeamById(teamId);
    const station = await this.findStationById(stationId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    const price = await this.getVisitPrice(stationId, teamId);

    if (team.coins < price) {
      return false; // Not enough coins to visit the station
    }

    const visitedStations = await this.findVisitedStationsByTeam(teamId);
    return !visitedStations.some(station => station._id!.toString() === stationId);
  }

  async findVisitedStationsByTeam(teamId: string) {
    return await this.stationCheckinHistoryRepository.findVisitedStationsByTeam(teamId);
  }

  async getVisitPrice(stationId: string, teamId: string) {
    const station = await this.findStationById(stationId);

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    const visitedStations = await this.findVisitedStationsByTeam(teamId);
    const visitCount = visitedStations.filter(station => station._id!.toString() === stationId).length;

    // Must be greater than or equal to 0
    switch (station.difficulty) {
      case StationDifficultyEnum.EASY:
        return Math.max(visitCount - 1, 0);
      case StationDifficultyEnum.MEDIUM:
        return Math.max(2 * visitCount - 1, 0);
      case StationDifficultyEnum.HARD:
        return Math.max(3 * visitCount - 1, 0);
      default:
        throw new NotFoundException('Station difficulty not found');
    }
  }
}
