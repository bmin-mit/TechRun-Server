import { UserRoleEnum } from '@common/enums/user-role.enum';
import { AuthRequest } from '@common/interfaces/auth-request.interface';
import { PublicAnnouncementDto } from '@dtos/notification.dto';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/guards/auth.guard';
import { NotificationRepository } from '@/notification/notification.repository';
import { NotificationService } from '@/notification/notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService, private readonly notificationRepository: NotificationRepository) {
  }

  @ApiOperation({ description: 'Send a public announcement' })
  @Post('send-pa')
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  async sendPublicAnnouncement(@Body() body: PublicAnnouncementDto, @Request() req: AuthRequest): Promise<void> {
    await this.notificationService.sendPublicAnnouncement(body, req.user._id!);
  }
}
