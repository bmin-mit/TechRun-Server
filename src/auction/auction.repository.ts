import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkillCardEnum } from '@/common/enums/skill-card.enum';
import { AuctionHistory } from '@/schemas/auction-history.schema';
import { AuctionStatus } from '@/schemas/auction-status.schema';
import { Auction } from '@/schemas/auction.schema';

@Injectable()
export class AuctionRepository {
  constructor(
    @InjectModel(Auction.name)
    private readonly auctionModel: Model<Auction>,
    @InjectModel(AuctionStatus.name)
    private readonly auctionStatusModel: Model<AuctionStatus>,
    @InjectModel(AuctionHistory.name)
    private readonly auctionHistoryModel: Model<AuctionHistory>,
  ) {
  }

  async getAuctionHistory(auctionId: string) {
    return await this.auctionHistoryModel.find({ auction: auctionId }).sort({ createdAt: -1 }).exec();
  }

  async getBids(auctionId: string) {
    return await this.auctionStatusModel.find({ auction: auctionId }).sort({ auctionedPrice: -1 }).exec();
  }

  async getAuctionWinnerLoser(auctionId: string) {
    const teams = await this.auctionStatusModel
      .find({ auction: auctionId })
      .sort({ auctionedPrice: -1 })
      .distinct('team')
      .exec();
    return {
      winner: teams[0],
      losers: teams.filter(team => team.username !== teams[0].username),
    };
  }

  async createAuction(skillCard: SkillCardEnum, prepareDurationInSeconds: number, durationInSeconds: number) {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (prepareDurationInSeconds + durationInSeconds) * 1000);
    // eslint-disable-next-line new-cap
    const auction = new this.auctionModel({
      skillCard,
      durationInSeconds,
      startTime,
      endTime,
    });

    return await auction.save();
  }

  async createBid(auctionId: string, teamUsername: string, price: number) {
    const auctionStatus = await this.auctionStatusModel.findOne({ auction: auctionId, team: teamUsername });
    if (auctionStatus) {
      // Update the existing bid
      auctionStatus.auctionedPrice = price;
      await auctionStatus.save();
    }
    else {
      // Create new bid
      // eslint-disable-next-line new-cap
      const newAuctionStatus = new this.auctionStatusModel({
        auction: auctionId,
        team: teamUsername,
        auctionedPrice: price,
      });
      await newAuctionStatus.save();
    }

    // eslint-disable-next-line new-cap
    const auctionHistory = new this.auctionHistoryModel({
      auction: auctionId,
      team: teamUsername,
      price,
    });

    await auctionHistory.save();
  }

  async findAuctionById(auctionId: string) {
    return await this.auctionModel.findById(auctionId).exec();
  }
}
