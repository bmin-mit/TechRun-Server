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
import { CreateItemReqDto } from '@/dtos/item.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { ItemService } from '@/item/item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({ summary: 'Get item list', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/items')
  async findAllItems() {
    return await this.itemService.findAllItems();
  }

  @ApiOperation({ summary: 'Get item by codename', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/codename/:codename')
  async findItemByCodename(@Param('codename') codename: string) {
    return await this.itemService.findItemByCodename(codename);
  }

  @ApiOperation({ summary: 'Get item by ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/id/:id')
  async findItemsById(@Param('id') id: string) {
    return await this.itemService.findItemsById(id);
  }

  @ApiOperation({ summary: 'Get items by type', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/type/:type')
  async findItemsByType(@Param('type') type: string) {
    return await this.itemService.findItemsByType(type);
  }

  @ApiOperation({ summary: 'Create a new item', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post()
  async createNewItem(@Body() item: CreateItemReqDto) {
    return await this.itemService.createNewItem(item);
  }

  @ApiOperation({ summary: 'Update an item', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Put('/:id')
  async updateItem(@Param('id') id: string, @Body() item: CreateItemReqDto) {
    return await this.itemService.updateItem(id, item);
  }

  @ApiOperation({ summary: 'Delete an item', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Delete('/:id')
  async deleteItem(@Param('id') id: string) {
    return await this.itemService.deleteItem(id);
  }

  @ApiOperation({ summary: 'Use an item' })
  @UseGuards(AuthGuard(UserRoleEnum.LEADER))
  @Post('/use')
  async useItem(
    @Param('itemId') itemId: string,
    @Param('objectiveTeamId') objectiveTeamId: string,
    @Request() req: AuthRequest,
  ) {
    const teamId = req.user.team!._id!.toString();
    return await this.itemService.useItem(teamId, itemId, objectiveTeamId);
  }
}
