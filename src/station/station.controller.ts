import { UserRoleEnum } from '@common/enums/user-role.enum';
import { CreateStationReqDto, UpdateStationReqDto } from '@dtos/station.dto';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/guards/auth.guard';
import { StationService } from '@/station/station.service';

@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @ApiOperation({ description: 'Get all stations' })
  @UseGuards(AuthGuard())
  @Get()
  async findAllStations() {
    return await this.stationService.findAllStations();
  }

  @ApiOperation({ description: 'Find station by name' })
  @UseGuards(AuthGuard())
  @Get('/:name')
  async findStationByName(@Param('name') name: string) {
    return await this.stationService.findStationByName(name);
  }

  @ApiOperation({ description: 'Find station by ID' })
  @UseGuards(AuthGuard())
  @Get('/:id')
  async findStationById(@Param('id') id: string) {
    return await this.stationService.findStationById(id);
  }

  @ApiOperation({ description: 'Create a new station' })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  async createNewStation(@Body() stationData: CreateStationReqDto) {
    return await this.stationService.createNewStation(stationData);
  }

  @ApiOperation({ description: 'Update a station' })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Put('/update/:id')
  async updateStation(@Body() stationData: UpdateStationReqDto, @Param('id') id: string) {
    return await this.stationService.updateStation(id, stationData);
  }

  @ApiOperation({ description: 'Delete a station' })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Delete('/delete/:id')
  async deleteStation(@Param('id') id: string) {
    return await this.stationService.deleteStation(id);
  }
}
