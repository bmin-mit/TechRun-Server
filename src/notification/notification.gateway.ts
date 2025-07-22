import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationTypeEnum } from '@/common/enums/notification-type.enum';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AnnouncementDto } from '@/dtos/notification.dto';
import { UserRepository } from '@/user/user.repository';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationGateway.name);
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    // Join the room with the team ID based on the JWT token for private notifications
    try {
      const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
      if (type !== 'Bearer') {
        this.logger.warn(`Client ${client.id} connected without Bearer token`);
        return;
      }

      const tokenData: { sub: string } = this.jwtService.verify(token);

      if (!tokenData || !tokenData.sub) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        return;
      }

      const user = await this.userRepository.findUserById(tokenData.sub);

      if (!user) {
        this.logger.warn(`Client ${client.id} connected with non-existent user ID: ${tokenData.sub}`);
        return;
      }

      // Join the room with the team ID
      if (user.team) {
        const teamId = user.team._id!.toString();
        await client.join(teamId);
        this.logger.log(`Client ${client.id} joined room: ${teamId}`);
      }

      // If the user is an admin, join the admin room
      if (user.role === UserRoleEnum.ADMIN) {
        await client.join('admin');
        this.logger.log(`Client ${client.id} joined admin room`);
      }
    }
    catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
    }
  }

  sendPublicAnnouncement(body: AnnouncementDto): void {
    this.logger.log(`Sending notification: ${JSON.stringify(body)}`);
    this.server.emit('notification', body);
  }

  sendTickToAuctionNotification(tick: number) {
    this.logger.log(`Sending tick-to-auction notification: ${tick}`);
    this.server.emit(NotificationTypeEnum.TICK_TO_AUCTION, tick);
  }

  sendAuctionStartNotification(item: string) {
    this.logger.log(`Sending auction start notification: ${item}`);
    this.server.emit(NotificationTypeEnum.AUCTION_START, { item });
  }

  sendAuctionTickNotification(tick: number) {
    this.logger.log(`Sending auction tick notification: ${tick}`);
    this.server.emit(NotificationTypeEnum.AUCTION_TICK, tick);
  }

  sendAuctionBidNotificationToAdmin() {
    this.logger.log(`Sending auction bid notification to admin`);
    this.server.to('admin').emit(NotificationTypeEnum.AUCTION_BID, {});
  }

  sendAuctionEndNotification(winnerName: string, item: string) {
    this.logger.log(`Sending auction end notification: ${winnerName}, ${item}`);
    this.server.emit(NotificationTypeEnum.AUCTION_END, { winner: winnerName, item });
  }

  sendCoinsUpdateNotification(teamId: string, coins: number, reason: string) {
    this.logger.log(`Sending coins update notification: ${teamId}, ${coins}, ${reason}`);
    this.server.to(teamId).emit(NotificationTypeEnum.COINS_UPDATE, { teamId, coins, reason });
  }

  sendItemUpdateNotification(teamId: string, itemId: string, quantity: number, reason: string) {
    this.logger.log(`Sending item update notification: ${teamId}, ${itemId}, ${quantity}, ${reason}`);
    this.server.to(teamId).emit(NotificationTypeEnum.ITEM_UPDATE, { teamId, itemId, quantity, reason });
  }

  sendItemUsedOnNotification(teamId: string, itemId: string, objectiveTeamId?: string) {
    this.logger.log(`Sending item used on notification: ${teamId}, ${itemId}, ${objectiveTeamId}`);
    this.server.to(teamId).emit(NotificationTypeEnum.ITEM_USED, { teamId, itemId, objectiveTeamId });

    if (objectiveTeamId) {
      this.server.to(objectiveTeamId).emit(NotificationTypeEnum.ITEM_USED, { teamId, itemId, objectiveTeamId });
    }
  }

  sendPrivateAnnouncementNotification(teamId: string, body: AnnouncementDto) {
    this.server.to(teamId).emit(NotificationTypeEnum.PRIVATE_ANNOUNCEMENT, body);
  }
}
