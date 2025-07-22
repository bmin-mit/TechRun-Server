import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { CreateTeamReqDto, OtherTeamsCoinsResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { TeamService } from '@/team/team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {
  }

  @ApiOperation({ description: 'Get all teams', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/teams')
  async getAllTeams() {
    return await this.teamService.findAllTeams();
  }

  @ApiOperation({ description: 'Get team by team codename', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/:teamCodename')
  async getTeamByName(@Param('teamCodename') teamCodename: string) {
    return await this.teamService.findTeamByCodename(teamCodename);
  }

  @ApiOperation({ description: 'Get team by team ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/:teamId')
  async getTeamById(@Param('teamId') teamId: string) {
    return await this.teamService.findTeamById(teamId);
  }

  @ApiOperation({ description: 'Admin get team coins by team ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/coins/:teamId')
  async adminGetTeamCoins(@Param('teamId') teamId: string) {
    return await this.teamService.getTeamCoins(teamId);
  }

  @ApiOperation({ description: 'Get other teams\'s coins, only on the preparation of the auction' })
  @UseGuards(AuthGuard())
  @Get('/other-teams-coins')
  @ApiResponse({ status: 200, description: 'Returns other teams\' coins', type: [OtherTeamsCoinsResDto] })
  async getOtherTeamsCoins() {
    return await this.teamService.getOtherTeamsCoins();
  }

  @ApiOperation({ description: 'Get my team coins' })
  @UseGuards(AuthGuard())
  @Get('/coins')
  async getTeamCoins(@Request() req: AuthRequest) {
    return await this.teamService.getTeamCoins(req.user.team!._id!.toString());
  }

  @ApiOperation({ description: 'Update team coins', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/update-coins')
  async updateTeamCoins(
    @Query('teamId') teamId: string,
    @Query('coins') coins: number,
    @Query('reason') reason: string,
  ) {
    return await this.teamService.updateTeamCoins(teamId, coins, reason);
  }

  @ApiOperation({ description: 'Create a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  async createTeam(@Body() teamData: CreateTeamReqDto) {
    return await this.teamService.createTeam(teamData);
  }

  @ApiOperation({ description: 'Update a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/update/:teamId')
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() teamData: UpdateTeamReqDto,
  ) {
    return await this.teamService.updateTeam(teamId, teamData);
  }

  @ApiOperation({ description: 'Delete a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/delete/:teamId')
  async deleteTeam(@Param('teamId') teamId: string) {
    return await this.teamService.deleteTeam(teamId);
  }
}
