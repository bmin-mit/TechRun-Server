import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { AnnouncementDto } from '@/dtos/notification.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { NotificationRepository } from '@/notification/notification.repository';
import { NotificationService } from '@/notification/notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService, private readonly notificationRepository: NotificationRepository) {
  }

  @ApiOperation({ description: 'Send a public announcement', tags: ['Admin'] })
  @Post('/send-pa')
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  async sendPublicAnnouncement(@Body() body: AnnouncementDto, @Request() req: AuthRequest): Promise<void> {
    await this.notificationService.sendPublicAnnouncement(body, req.user._id!.toString());
  }

  @ApiOperation({ description: 'Send a private announcement to team', tags: ['Admin'] })
  @Post('/send-pa-team/:teamId')
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  async sendPrivateAnnouncementToTeam(
    @Param('teamId') teamId: string,
    @Body() body: AnnouncementDto,
  ): Promise<void> {
    await this.notificationService.sendPrivateAnnouncementNotification(teamId, body);
  }
}
