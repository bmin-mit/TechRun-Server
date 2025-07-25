import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuctionService } from '@/auction/auction.service';
import { CreateTeamReqDto, MeResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly auctionService: AuctionService,
    private readonly configService: ConfigService,
  ) {
    (async () => {
      if (await this.findTeamByUsername('admin') === null) {
        this.logger.warn('No user with username "admin" found. Creating an admin user.');
        await this.teamRepository.createAdmin(
          this.configService.get<string>('adminPassword') || 'admin',
        );
      }
      else {
        this.logger.log('Admin user already exists. Updating admin password to reflect ENV.');
        await this.teamRepository.updateAdminPassword(
          this.configService.get<string>('adminPassword') || 'admin',
        );
      }
    })();
  }

  async findTeamByUsername(teamCodename: string) {
    return await this.teamRepository.findTeamByUsername(teamCodename);
  }

  async findTeamById(teamId: string) {
    return await this.teamRepository.findTeamById(teamId);
  }

  async findAllTeams() {
    return await this.teamRepository.findAllTeams();
  }

  async getTeamUnlockedPuzzles(teamId: string) {
    const team = await this.teamRepository.findTeamById(teamId);
    if (!team) {
      throw new NotFoundException('The team with this ID does not exist.');
    }
    const teamUsername = team.username;
    return await this.teamRepository.getTeamUnlockedPuzzles(teamUsername);
  }

  async updateTeamCoins(teamUsername: string, coins: number, reason: string) {
    return await this.teamRepository.updateTeamCoins(teamUsername, coins, reason);
  }

  async unlockTeamPuzzle(teamUsername: string, unlockIndex: number) {
    return await this.teamRepository.unlockPuzzle(teamUsername, unlockIndex);
  }

  async createTeam(teamData: CreateTeamReqDto) {
    if (await this.findTeamByUsername(teamData.username)) {
      throw new ConflictException('The team with this username already exists.');
    }

    return await this.teamRepository.createTeam(teamData);
  }

  async updateTeam(teamUsername: string, teamData: UpdateTeamReqDto) {
    if (await this.findTeamByUsername(teamUsername) === null) {
      throw new NotFoundException('The team with this username does not exist.');
    }

    if (await this.teamRepository.findTeamByUsername(teamData.username)) {
      throw new ConflictException('The team with this username already exists.');
    }

    return await this.teamRepository.updateTeam(teamUsername, teamData);
  }

  async deleteTeam(teamUsername: string) {
    if (await this.findTeamByUsername(teamUsername) === null) {
      throw new NotFoundException('The team with this username does not exist.');
    }

    return await this.teamRepository.deleteTeam(teamUsername);
  }

  async getOtherTeamsCoins() {
    if (!this.auctionService.canSeeOtherTeamsCoins()) {
      throw new ConflictException('You can only see other teams\' coins during the auction preparation phase.', 'auction_preparation_phase');
    }

    return await this.teamRepository.getOtherTeamsCoins();
  }

  async me(teamId: string): Promise<MeResDto> {
    const team = await this.teamRepository.findTeamById(teamId);
    if (!team) {
      throw new NotFoundException('The team with this ID does not exist.');
    }

    return {
      _id: team._id!.toString(),
      name: team.name,
      username: team.username,
      coins: team.coins,
      unlockedPuzzles: team.unlockedPuzzles,
      skillCards: team.skillCards,
    };
  }

  async getTeamSkillCardHistory(teamUsername: string) {
    return this.teamRepository.getTeamSkillCardHistory(teamUsername);
  }
}
