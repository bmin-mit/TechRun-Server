import { Body, Controller, Get, Param, Post, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { CreateTeamReqDto, MeResDto, OtherTeamsCoinsResDto, UpdateTeamReqDto } from '@/dtos/team.dto';
import { WithPinDto } from '@/dtos/with-pin.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { Station } from '@/schemas/station.schema';
import { StationService } from '@/station/station.service';
import { TeamService } from '@/team/team.service';

@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly stationService: StationService,
  ) {
  }

  @ApiOperation({ description: 'Get all teams', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/teams')
  async getAllTeamsAdmin() {
    return await this.teamService.findAllTeams();
  }

  @ApiOperation({ description: 'Get all teams', tags: ['WithPin'] })
  @Post('/staff/teams')
  async getAllTeamsStation(@Body() body: WithPinDto) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return (await this.teamService.findAllTeams()).map(team =>
      ({
        ...team,
        password: undefined,
      }),
    );
  }

  @ApiOperation({ description: 'Get team by team username', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/username/:teamUsername')
  async getTeamByName(@Param('teamUsername') teamUsername: string) {
    return await this.teamService.findTeamByUsername(teamUsername);
  }

  @ApiOperation({ description: 'Get team by team ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/id/:teamId')
  async getTeamById(@Param('teamId') teamId: string) {
    return await this.teamService.findTeamById(teamId);
  }

  @ApiOperation({ description: 'Get other teams\'s coins, only on the preparation of the auction' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/other-teams-coins')
  @ApiResponse({ status: 200, description: 'Returns other teams\' coins', type: [OtherTeamsCoinsResDto] })
  async getOtherTeamsCoins() {
    return await this.teamService.getOtherTeamsCoins();
  }

  @ApiOperation({ description: 'Update team coins', tags: ['WithPin'] })
  @Post('/update-coins')
  async updateTeamCoins(
    @Query('teamUsername') teamUsername: string,
    @Query('coins') coins: number,
    @Query('reason') reason: string,
    @Body() body: WithPinDto,
  ) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return await this.teamService.updateTeamCoins(body.stationCodename, teamUsername, coins, reason);
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

  @ApiOperation({ description: 'Get team unlocked puzzles' })
  @ApiResponse({ status: 200, description: 'Returns the team\'s unlocked puzzles', type: [Station] })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/unlocked-puzzles')
  async getTeamUnlockedPuzzles(@Request() req: AuthRequest) {
    return await this.teamService.getTeamUnlockedPuzzles(req.user._id!.toString());
  }

  @ApiOperation({ description: 'Unlock a puzzle for the team', tags: ['WithPin'] })
  @Post('/unlock-puzzle')
  async unlockTeamPuzzle(
    @Query('teamUsername') teamUsername: string,
    @Body() body: WithPinDto,
  ) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return await this.teamService.unlockTeamPuzzle(teamUsername, body.stationCodename);
  }

  @ApiOperation({ description: 'Get my team info' })
  @ApiResponse({ status: 200, description: 'Returns my team info', type: MeResDto })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/my-team')
  async getMyTeam(@Request() req: AuthRequest) {
    return this.teamService.me(req.user._id!.toString());
  }

  @ApiOperation({ description: 'Get team\'s skill card history', tags: ['WithPin'] })
  @Post('/skill-card-history/:teamUsername')
  async getTeamSkillCardHistory(
    @Param('teamUsername') teamUsername: string,
    @Body() body: WithPinDto,
  ) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return await this.teamService.getTeamSkillCardHistory(teamUsername);
  }

  @ApiOperation({ description: 'Get my all skill card history' })
  async getAllSkillCardHistory() {
    return await this.teamService.getAllSkillCardHistory();
  }

  @ApiOperation({ description: 'Use my team\'s skill card' })
  @ApiQuery({ name: 'skillCard', enum: SkillCardEnum, required: true, description: 'Skill card type to use' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Post('/use-skill-card')
  async useSkillCard(
    @Request() req: AuthRequest,
    @Query('skillCard') skillCard: SkillCardEnum,
  ) {
    console.log(`Using skill card: ${skillCard} for team ID: ${req.user.username}`);
    return await this.teamService.useSkillCard(req.user._id!.toString(), skillCard);
  }
}
