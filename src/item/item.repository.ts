import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemActionEnum } from '@/common/enums/item-action.enum';
import { CreateItemReqDto, UpdateItemReqDto } from '@/dtos/item.dto';
import { ItemHistory } from '@/schemas/item-history.schema';
import { Item } from '@/schemas/item.schema';
import { Team } from '@/schemas/team.schema';

@Injectable()
export class ItemRepository {
  constructor(
    @InjectModel(Item.name) private readonly itemModel: Model<Item>,
    @InjectModel(ItemHistory.name) private readonly itemHistoryModel: Model<ItemHistory>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
  ) {
  }

  async findAllItems() {
    return await this.itemModel.find({}).sort({ type: 1 }).exec();
  }

  async findItemByCodename(codename: string) {
    return await this.itemModel.findOne({ codename }).exec();
  }

  async findItemById(id: string) {
    return await this.itemModel.findById(id).exec();
  }

  async findItemsByType(type: string) {
    return await this.itemModel.find({ type }).exec();
  }

  async createNewItem(item: CreateItemReqDto) {
    // eslint-disable-next-line new-cap
    const newItem = new this.itemModel(item);
    return await newItem.save();
  }

  async addItemToTeam(teamId: string, itemId: string, quantity: number) {
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      return null; // Team not found
    }

    const itemIndex = team.items.findIndex(item => item.itemId === itemId);

    if (itemIndex !== -1) {
      // Item already exists in the team, update quantity
      team.items[itemIndex].quantity += quantity;
    }
    else {
      // Item does not exist, add a new item
      team.items.push({ itemId, quantity });
    }

    // Write to ItemHistory
    await this.writeItemHistory(teamId, itemId, ItemActionEnum.ADDED, 'Admin add item to team');

    return await team.save();
  }

  async removeItemFromTeam(teamId: string, itemId: string, quantity: number) {
    const team = await this.teamModel.findById(teamId).exec();

    if (!team) {
      return null; // Team not found
    }

    const itemIndex = team.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1 || team.items[itemIndex].quantity < quantity) {
      return null; // Item not found or insufficient quantity
    }

    team.items[itemIndex].quantity -= quantity;
    if (team.items[itemIndex].quantity <= 0) {
      team.items.splice(itemIndex, 1); // Remove item if quantity is zero
    }

    // Write to ItemHistory
    await this.writeItemHistory(teamId, itemId, ItemActionEnum.REMOVED, 'Admin remove item from team');

    return await team.save();
  }

  async writeItemHistory(teamId: string, itemId: string, action: string, reason: string) {
    await this.itemHistoryModel.create({
      team: teamId,
      item: itemId,
      action,
      timestamp: new Date(),
      reason,
    });
  }

  async markItemAsUsed(teamId: string, itemId: string, objectiveTeamId: string): Promise<Team | null> {
    const team = await this.teamModel.findById(teamId).exec();
    const objectiveTeam = await this.teamModel.findById(objectiveTeamId).exec();
    if (!team || !objectiveTeam) {
      return null;
    }

    const itemIndex = team.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1 || team.items[itemIndex].quantity <= 0) {
      return null; // Item isn't found or quantity is zero
    }
    team.items[itemIndex].quantity -= 1;
    if (team.items[itemIndex].quantity === 0) {
      team.items.splice(itemIndex, 1); // Remove item if quantity is zero
    }

    // Write to ItemHistory
    await this.itemHistoryModel.create({
      team: teamId,
      item: itemId,
      action: ItemActionEnum.USED,
      timestamp: new Date(),
      reason: `Item used by team on ${objectiveTeam.name} (${objectiveTeam.codename})`,
      objectiveTeam: objectiveTeamId,
    });

    return await team.save();
  }

  async updateItem(id: string, item: UpdateItemReqDto) {
    return await this.itemModel.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async deleteItem(id: string) {
    return await this.itemModel.findByIdAndDelete(id).exec();
  }
}
