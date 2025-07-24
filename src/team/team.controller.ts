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

  @ApiOperation({ description: 'Get team by team username', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/:teamUsername')
  async getTeamByName(@Param('teamUsername') teamUsername: string) {
    return await this.teamService.findTeamByUsername(teamUsername);
  }

  @ApiOperation({ description: 'Get team by team ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/:teamId')
  async getTeamById(@Param('teamId') teamId: string) {
    return await this.teamService.findTeamById(teamId);
  }

  @ApiOperation({ description: 'Admin get team coins by team ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/coins/:teamUsername')
  async adminGetTeamCoins(@Param('teamUsername') teamUsername: string) {
    return await this.teamService.getTeamCoins(teamUsername);
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
    return await this.teamService.getTeamCoins(req.user._id!.toString());
  }

  @ApiOperation({ description: 'Update team coins', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/update-coins')
  async updateTeamCoins(
    @Query('teamUsername') teamUsername: string,
    @Query('coins') coins: number,
    @Query('reason') reason: string,
  ) {
    return await this.teamService.updateTeamCoins(teamUsername, coins, reason);
  }

  @ApiOperation({ description: 'Create a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  async createTeam(@Body() teamData: CreateTeamReqDto) {
    return await this.teamService.createTeam(teamData);
  }

  @ApiOperation({ description: 'Update a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/update/:teamUsername')
  async updateTeam(
    @Param('teamUsername') teamUsername: string,
    @Body() teamData: UpdateTeamReqDto,
  ) {
    return await this.teamService.updateTeam(teamUsername, teamData);
  }

  @ApiOperation({ description: 'Delete a team', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/delete/:teamUsername')
  async deleteTeam(@Param('teamUsername') teamUsername: string) {
    return await this.teamService.deleteTeam(teamUsername);
  }
}
