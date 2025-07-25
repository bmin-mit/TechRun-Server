import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuctionService } from '@/auction/auction.service';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { AuthGuard } from '@/guards/auth.guard';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @ApiOperation({ description: 'Get auction status', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/status')
  getAuctionStatus() {
    return this.auctionService.getAuctionStatus();
  }

  @ApiOperation({ description: 'Get auction history', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/history')
  getAuctionHistory() {
    return this.auctionService.getAuctionHistory();
  }

  @ApiOperation({ description: 'Create auction', tags: ['Admin'] })
  @ApiQuery({ name: 'skillCard', enum: SkillCardEnum, required: true, description: 'Skill card type for the auction' })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  createAuction(
    @Query('skillCard') skillCard: SkillCardEnum,
    @Query('prepareDurationInSeconds') prepareDurationInSeconds: number,
    @Query('durationInSeconds') durationInSeconds: number,
  ) {
    return this.auctionService.createAuction(skillCard, prepareDurationInSeconds, durationInSeconds);
  }

  @ApiOperation({ description: 'Get current auction' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Get('/current')
  getCurrentAuction() {
    return this.auctionService.getCurrentAuction();
  }

  @ApiOperation({ description: 'Get auction bids', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/bids')
  getAuctionBids(
    @Query('auctionId') auctionId?: string,
  ) {
    return this.auctionService.getTeamsLatestBids(auctionId);
  }

  @ApiOperation({ description: 'Record auction bid' })
  @UseGuards(AuthGuard(UserRoleEnum.PLAYER))
  @Post('/bid')
  recordAuctionBid(
    @Query('bidPrice') bidPrice: number,
    @Request() req: AuthRequest,
  ) {
    const bidderTeamId = req.user._id!.toString();
    return this.auctionService.recordAuctionBid(bidderTeamId, bidPrice);
  }
}
