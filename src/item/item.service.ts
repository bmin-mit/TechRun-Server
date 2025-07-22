import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateItemReqDto, UpdateItemReqDto } from '@/dtos/item.dto';
import { ItemRepository } from '@/item/item.repository';
import { NotificationService } from '@/notification/notification.service';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly teamRepository: TeamRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllItems() {
    return await this.itemRepository.findAllItems();
  }

  async findItemByCodename(codename: string) {
    return await this.itemRepository.findItemByCodename(codename);
  }

  async findItemsById(id: string) {
    return await this.itemRepository.findItemById(id);
  }

  async findItemsByType(type: string) {
    return await this.itemRepository.findItemsByType(type);
  }

  async createNewItem(item: CreateItemReqDto) {
    return await this.itemRepository.createNewItem(item);
  }

  async updateItem(id: string, item: UpdateItemReqDto) {
    return await this.itemRepository.updateItem(id, item);
  }

  async deleteItem(id: string) {
    return await this.itemRepository.deleteItem(id);
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async useItem(teamId: string, itemId: string, objectiveTeamId: string) {
    throw new BadRequestException('Not yet implemented');
    // const team = await this.teamRepository.findTeamById(teamId);
    //
    // if (!team) {
    //   throw new NotFoundException('Team not found');
    // }
    //
    // // Execute the effect of the item
    // const item = await this.itemRepository.findItemById(itemId);
    // if (!item) {
    //   throw new NotFoundException('Item not found');
    // }
    // if (item.type !== ItemTypeEnum.NANG_LUC_SO) {
    //   throw new BadRequestException('This item cannot be used');
    // }
    //
    // await this.itemRepository.markItemAsUsed(teamId, itemId, objectiveTeamId);
    //
    // switch (item.codename) {
    // }
  }
}
