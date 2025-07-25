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

  async findStationByCodename(stationCodename: string) {
    return await this.stationRepository.findStationByCodename(stationCodename);
  }

  async findStationById(stationId: string) {
    return await this.stationRepository.findStationById(stationId);
  }

  async findAllStations() {
    return await this.stationRepository.findAllStations();
  }

  async createNewStation(stationData: CreateStationReqDto) {
    if (await this.findStationByCodename(stationData.name)) {
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

    // Check if the team skipped this station and had not yet paid (if paid, the skip entry would be removed)
    const isSkipped = this.stationRepository.isSkipped(teamId, station!.stationGroup._id!.toString());
    if (isSkipped) {
      throw new ConflictException('Team has skipped this station and cannot visit it again until unskipped (paid).');
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

  async skip(teamId: string, stationGroupCodename: string) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    if (!(await this.stationRepository.findStationByCodename(stationGroupCodename))) {
      throw new NotFoundException('Station group not found');
    }

    const stationGroupId = (await this.stationRepository.findStationByCodename(stationGroupCodename))!._id!.toString();

    return await this.stationRepository.skip(teamId, stationGroupId);
  }

  async unskip(teamId: string, stationGroupCodename: string) {
    if (!(await this.teamRepository.findTeamById(teamId))) {
      throw new NotFoundException('Team not found');
    }

    if (!(await this.stationRepository.findStationByCodename(stationGroupCodename))) {
      throw new NotFoundException('Station group not found');
    }

    const stationGroupId = (await this.stationRepository.findStationByCodename(stationGroupCodename))!._id!.toString();

    const teamUsername = (await this.teamRepository.findTeamById(teamId))!.username;
    if ((await this.teamRepository.getTeamCoins(teamUsername) || 0) < await this.stationRepository.getUnskipPrice(stationGroupId)) {
      throw new ConflictException('Not enough coins to unskip this station group');
    }

    await this.teamRepository.updateTeamCoins(teamUsername, -await this.stationRepository.getUnskipPrice(stationGroupId), `Unskipping station group ${stationGroupId}`);

    return await this.stationRepository.unskip(teamId, stationGroupId);
  }
}
