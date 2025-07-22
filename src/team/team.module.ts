import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionModule } from '@/auction/auction.module';
import { NotificationModule } from '@/notification/notification.module';
import { CoinsHistory, CoinsHistorySchema } from '@/schemas/coins-history.schema';
import { ItemHistory, ItemHistorySchema } from '@/schemas/item-history.schema';
import { Team, TeamSchema } from '@/schemas/team.schema';
import { User, UserSchema } from '@/schemas/user.schema';
import { TeamRepository } from '@/team/team.repository';
import { UserModule } from '@/user/user.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Team.name, schema: TeamSchema },
        { name: User.name, schema: UserSchema },
        { name: CoinsHistory.name, schema: CoinsHistorySchema },
        { name: ItemHistory.name, schema: ItemHistorySchema },
      ],
    ),
    UserModule,
    forwardRef(() => AuctionModule),
    NotificationModule,
  ],
  providers: [TeamService, TeamRepository],
  controllers: [TeamController],
  exports: [TeamRepository],
})
export class TeamModule {}
