import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuctionService } from '@/auction/auction.service';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import { AuthGuard } from '@/guards/auth.guard';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @ApiOperation({ summary: 'Get auction status', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/status')
  getAuctionStatus() {
    return this.auctionService.getAuctionStatus();
  }

  @ApiOperation({ summary: 'Get auction history', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/history')
  getAuctionHistory() {
    return this.auctionService.getAuctionHistory();
  }

  @ApiOperation({ summary: 'Create auction', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/create')
  createAuction(
    @Query('itemId') itemId: string,
    @Query('prepareDurationInSeconds') prepareDurationInSeconds: number,
    @Query('durationInSeconds') durationInSeconds: number,
  ) {
    return this.auctionService.createAuction(itemId, prepareDurationInSeconds, durationInSeconds);
  }

  @ApiOperation({ summary: 'Get current auction' })
  @UseGuards(AuthGuard())
  @Get('/current')
  getCurrentAuction() {
    return this.auctionService.getCurrentAuction();
  }

  @ApiOperation({ summary: 'Get auction bids', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/bids')
  getAuctionBids(
    @Query('auctionId') auctionId?: string,
  ) {
    return this.auctionService.getTeamsLatestBids(auctionId);
  }

  @ApiOperation({ summary: 'Record auction bid' })
  @UseGuards(AuthGuard())
  @Post('/bid')
  recordAuctionBid(
    @Query('bidPrice') bidPrice: number,
    @Request() req: AuthRequest,
  ) {
    const bidderTeamUsername = req.user._id!.toString();
    return this.auctionService.recordAuctionBid(bidderTeamUsername, bidPrice);
  }
}
