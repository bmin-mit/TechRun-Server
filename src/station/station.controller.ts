import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { CreateStationReqDto, UpdateStationReqDto } from '@/dtos/station.dto';
import { WithPinDto } from '@/dtos/with-pin.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { StationService } from '@/station/station.service';
import { TeamService } from '@/team/team.service';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService, private readonly teamService: TeamService) {
  }

  @ApiOperation({ description: 'Get all stations' })
  @Get('/stations')
  async findAllStations() {
    return await this.stationService.findAllStations();
  }

  @ApiOperation({ description: 'Authenticate the station credential' })
  @Post('/auth')
  async authenticateStation(@Body() body: WithPinDto) {
    const isValid = await this.stationService.verifyPin(body);
    if (!isValid) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return { message: 'Authentication successful' };
  }

  @ApiOperation({ description: 'Find station by codename' })
  @Get('/codename/:codename')
  async findStationByCodename(@Param('codename') codename: string) {
    const station = await this.stationService.findStationByCodename(codename);
    if (!station) {
      throw new NotFoundException(`Station with codename "${codename}" not found`);
    }
    return station;
  }

  @ApiOperation({ description: 'Find station by ID' })
  @Get('/id/:id')
  async findStationById(@Param('id') id: string) {
    const station = await this.stationService.findStationById(id);
    if (!station) {
      throw new NotFoundException(`Station with ID "${id}" not found`);
    }
    return station;
  }

  @ApiOperation({ description: 'Get all stations that my team has visited' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/visited')
  async findVisitedStations(@Request() req: AuthRequest) {
    return await this.stationService.findVisitedStationsByTeam(req.user.username!.toString());
  }

  @ApiOperation({ description: 'Get the price of visiting the current station' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/visit-price/:id')
  async getVisitPrice(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.getVisitPrice(id, req.user._id!.toString());
  }

  @ApiOperation({ description: 'Can the team visit the current station?' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/can-visit/:id')
  async canTeamVisitStation(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.canTeamVisitStation(id, req.user._id!.toString());
  }

  @ApiOperation({ description: 'Mark a station as visited' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Post('/visit/:id')
  async visitStation(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.visitStation(id, req.user._id!.toString());
  }

  @ApiOperation({ description: 'Admin get all stations that a team has visited', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/visited/:teamUsername')
  async findVisitedStationsByTeam(@Param('teamUsername') teamUsername: string) {
    return await this.stationService.findVisitedStationsByTeam(teamUsername);
  }

  @ApiOperation({ description: 'Create a new station', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  async createNewStation(@Body() stationData: CreateStationReqDto) {
    return await this.stationService.createNewStation(stationData);
  }

  @ApiOperation({ description: 'Update a station', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Put('/update/:id')
  async updateStation(@Body() stationData: UpdateStationReqDto, @Param('id') id: string) {
    return await this.stationService.updateStation(id, stationData);
  }

  @ApiOperation({ description: 'Delete a station', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Delete('/delete/:id')
  async deleteStation(@Param('id') id: string) {
    return await this.stationService.deleteStation(id);
  }

  @ApiOperation({ description: 'Skip a station', tags: ['WithPin'] })
  @Post('/skip')
  async skipStation(
    @Query('teamId') teamId: string,
    @Body() body: WithPinDto,
  ) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return await this.stationService.skip(teamId, body.stationCodename);
  }

  @ApiOperation({ description: 'Unskip a station', tags: ['WithPin'] })
  //@UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/unskip')
  async unskipStation(
    @Query('teamId') teamId: string,
    @Query('noCoinsUpdate') noCoinsUpdate: boolean = false,
    @Body() body: WithPinDto,
  ) {
    if (!(await this.stationService.verifyPin(body))) {
      throw new UnauthorizedException('Invalid PIN code');
    }
    return await this.stationService.unskip(teamId, body.stationCodename, noCoinsUpdate);
  }
}
