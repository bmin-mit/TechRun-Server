import { PublicAnnouncementDto } from '@dtos/notification.dto';
import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);
  @WebSocketServer() private readonly server: Server;

  sendPublicAnnouncement(body: PublicAnnouncementDto): void {
    this.logger.log(`Sending notification: ${JSON.stringify(body)}`);
    this.server.emit('notification', body);
  }
}
