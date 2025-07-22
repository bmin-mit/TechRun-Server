import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemRepository } from '@/item/item.repository';
import { NotificationModule } from '@/notification/notification.module';
import { ItemHistory, ItemHistorySchema } from '@/schemas/item-history.schema';
import { Item, ItemSchema } from '@/schemas/item.schema';
import { Team, TeamSchema } from '@/schemas/team.schema';
import { TeamModule } from '@/team/team.module';
import { UserModule } from '@/user/user.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Item.name, schema: ItemSchema },
        { name: ItemHistory.name, schema: ItemHistorySchema },
        { name: Team.name, schema: TeamSchema },
      ],
    ),
    forwardRef(() => TeamModule),
    UserModule,
    NotificationModule,
  ],
  providers: [ItemService, ItemRepository],
  controllers: [ItemController],
  exports: [ItemRepository],
})
export class ItemModule {}
