import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionHistory } from '@/schemas/auction-history.schema';
import { Auction } from '@/schemas/auction.schema';

@Injectable()
export class AuctionRepository {
  constructor(
    @InjectModel(Auction.name)
    private readonly auctionModel: Model<Auction>,
    @InjectModel(AuctionHistory.name)
    private readonly auctionHistoryModel: Model<AuctionHistory>,
  ) {}

  async getAuctionHistory(auctionId: string) {
    return await this.auctionHistoryModel.find({ auction: auctionId }).sort({ createdAt: -1 }).exec();
  }

  async getTeamsLatestBids(auctionId: string) {
    // There will be many bids from one team, we want the latest bid from each user
    return await this.auctionHistoryModel.aggregate([
      { $match: { auction: auctionId } },
      { $sort: { createdAt: -1 } }, // Sort before grouping to ensure proper ordering
      {
        $group: {
          _id: '$team',
          latestBid: { $first: '$$ROOT' }, // Use $first since we've sorted in descending order
        },
      },
      { $replaceRoot: { newRoot: '$latestBid' } },
      {
        $lookup: {
          from: 'teams', // The collection name for teams
          localField: 'team',
          foreignField: '_id',
          as: 'teamData',
        },
      },
      {
        $addFields: {
          team: { $arrayElemAt: ['$teamData', 0] }, // Replace team reference with the actual document
        },
      },
      { $project: { teamData: 0 } }, // Remove the temporary array
      { $sort: { price: 1 } }, // Sort by price in ascending order
    ]).exec() as AuctionHistory[];
  }

  async getAuctionWinner(auctionId: string) {
    return (await this.getTeamsLatestBids(auctionId))[0].team;
  }

  async createAuction(itemId: string, prepareDurationInSeconds: number, durationInSeconds: number) {
    // eslint-disable-next-line new-cap
    const auction = new this.auctionModel({
      itemId,
      durationInSeconds,
      startTime: new Date(),
      endTime: new Date(Date.now() + (prepareDurationInSeconds + durationInSeconds) * 1000),
    });

    return await auction.save();
  }

  async createBid(auctionId: string, teamUsername: string, price: number) {
    // eslint-disable-next-line new-cap
    const auctionHistory = new this.auctionHistoryModel({
      auction: auctionId,
      team: teamUsername,
      price,
    });

    return await auctionHistory.save();
  }

  async findAuctionById(auctionId: string) {
    return await this.auctionModel.findById(auctionId).populate('item').exec();
  }
}
