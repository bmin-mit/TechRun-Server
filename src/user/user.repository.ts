import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'argon2';
import { Model } from 'mongoose';
import { argon2idOptions } from '@/common/constant/argon2id-options.const';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { CreateUserReqDto, UpdateUserReqDto } from '@/dtos/user.dto';
import { User } from '@/schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).populate('team').exec();
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).populate('team').exec();
  }

  async findAllUsers() {
    return this.userModel.find({}).populate('team').exec();
  }

  async findAllAdmins(): Promise<User[] | null> {
    return this.userModel.find({ role: UserRoleEnum.ADMIN }).exec();
  }

  async findAllByTeamId(teamId: string): Promise<User[] | null> {
    return this.userModel.find({ team: teamId }).populate('team').exec();
  }

  async findAllMembers(): Promise<User[] | null> {
    return this.userModel.find({ role: UserRoleEnum.MEMBER }).exec();
  }

  async findAllLeaders(): Promise<User[] | null> {
    return this.userModel.find({ role: UserRoleEnum.LEADER }).exec();
  }

  async createUser(user: CreateUserReqDto): Promise<User> {
    user.password = await hash(user.password, argon2idOptions);
    // eslint-disable-next-line new-cap
    const newUser = new this.userModel(user);
    const populatedUser = await this.userModel.populate(newUser, { path: 'team' });
    return populatedUser.save();
  }

  async markAsLoggedIn(username: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { username },
      { lastLogin: new Date() },
      { new: true },
    ).populate('team').exec();
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await hash(newPassword, argon2idOptions);
    return this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true },
    ).populate('team').exec();
  }

  async updateUser(userId: string, updateData: UpdateUserReqDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).populate('team').exec();
  }

  async deleteUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
