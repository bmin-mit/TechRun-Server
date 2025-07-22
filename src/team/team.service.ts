import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuctionService } from '@/auction/auction.service';
import { CreateTeamReqDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { NotificationService } from '@/notification/notification.service';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly auctionService: AuctionService,
    private readonly notificationService: NotificationService,
  ) {}

  async findTeamByCodename(teamCodename: string) {
    return await this.teamRepository.findTeamByCodename(teamCodename);
  }

  async findTeamById(teamId: string) {
    return await this.teamRepository.findTeamById(teamId);
  }

  async findAllTeams() {
    return await this.teamRepository.findAllTeams();
  }

  async getTeamCoins(teamId: string) {
    return await this.teamRepository.getTeamCoins(teamId);
  }

  async getTeamStations(teamId: string) {
    return await this.teamRepository.getTeamStations(teamId);
  }

  async getTeamMembers(teamId: string) {
    return await this.teamRepository.getTeamMembers(teamId);
  }

  async getTeamItems(teamId: string) {
    return await this.teamRepository.getTeamItems(teamId);
  }

  async updateTeamCoins(teamId: string, coins: number, reason: string) {
    await this.notificationService.sendCoinsUpdateNotification(teamId, coins, reason);
    return await this.teamRepository.updateTeamCoins(teamId, coins, reason);
  }

  async updateTeamItems(teamId: string, itemId: string, quantity: number, reason: string) {
    await this.notificationService.sendItemUpdateNotification(teamId, itemId, quantity, reason);
    return await this.teamRepository.updateTeamItems(teamId, itemId, quantity, reason);
  }

  async createTeam(teamData: CreateTeamReqDto) {
    if (await this.findTeamByCodename(teamData.codename)) {
      throw new ConflictException('The team with this codename already exists.');
    }

    return await this.teamRepository.createTeam(teamData);
  }

  async updateTeam(teamId: string, teamData: UpdateTeamReqDto) {
    if (await this.findTeamById(teamId) === null) {
      throw new NotFoundException('The team with this ID does not exist.');
    }

    if (await this.teamRepository.findTeamByCodename(teamData.codename)) {
      throw new ConflictException('The team with this codename already exists.');
    }

    return await this.teamRepository.updateTeam(teamId, teamData);
  }

  async deleteTeam(teamId: string) {
    if (await this.findTeamById(teamId) === null) {
      throw new NotFoundException('The team with this ID does not exist.');
    }

    return await this.teamRepository.deleteTeam(teamId);
  }

  async getOtherTeamsCoins() {
    if (!await this.auctionService.canSeeOtherTeamsCoins()) {
      throw new ConflictException('You can only see other teams\' coins during the auction preparation phase.', 'auction_preparation_phase');
    }

    return await this.teamRepository.getOtherTeamsCoins();
  }
}
