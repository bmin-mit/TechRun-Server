import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { CreateStationReqDto, UpdateStationReqDto } from '@/dtos/station.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { StationService } from '@/station/station.service';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @ApiOperation({ description: 'Get all stations' })
  @UseGuards(AuthGuard())
  @Get('/stations')
  async findAllStations() {
    return await this.stationService.findAllStations();
  }

  @ApiOperation({ description: 'Find station by name' })
  @UseGuards(AuthGuard())
  @Get('/name/:name')
  async findStationByName(@Param('name') name: string) {
    return await this.stationService.findStationByName(name);
  }

  @ApiOperation({ description: 'Find station by ID' })
  @UseGuards(AuthGuard())
  @Get('/id/:id')
  async findStationById(@Param('id') id: string) {
    return await this.stationService.findStationById(id);
  }

  @ApiOperation({ description: 'Get all stations that my team has visited' })
  @UseGuards(AuthGuard())
  @Get('/visited')
  async findVisitedStations(@Request() req: AuthRequest) {
    return await this.stationService.findVisitedStationsByTeam(req.user.team!._id!.toString());
  }

  @ApiOperation({ description: 'Get the price of visiting the current station' })
  @UseGuards(AuthGuard())
  @Get('/visit-price/:id')
  async getVisitPrice(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.getVisitPrice(id, req.user.team!._id!.toString());
  }

  @ApiOperation({ description: 'Can the team visit the current station?' })
  @UseGuards(AuthGuard())
  @Get('/can-visit/:id')
  async canTeamVisitStation(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.canTeamVisitStation(id, req.user.team!._id!.toString());
  }

  @ApiOperation({ description: 'Mark a station as visited' })
  @UseGuards(AuthGuard(UserRoleEnum.LEADER))
  @Post('/visit/:id')
  async visitStation(@Param('id') id: string, @Request() req: AuthRequest) {
    return await this.stationService.visitStation(id, req.user.team!._id!.toString());
  }

  @ApiOperation({ description: 'Admin get all stations that a team has visited', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/visited/:teamId')
  async findVisitedStationsByTeam(@Param('teamId') teamId: string) {
    return await this.stationService.findVisitedStationsByTeam(teamId);
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
}
