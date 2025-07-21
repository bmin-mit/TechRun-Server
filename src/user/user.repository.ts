import { argon2idOptions } from '@common/constant/argon2id-options.const';
import { CreateUserReqDto, UpdateUserReqDto } from '@dtos/user.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@schemas/user.schema';
import { hash } from 'argon2';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async findAllUsers() {
    return this.userModel.find({}).exec();
  }

  async createUser(user: CreateUserReqDto): Promise<User> {
    user.password = await hash(user.password, argon2idOptions);
    // eslint-disable-next-line new-cap
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async markAsLoggedIn(username: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { username },
      { lastLogin: new Date() },
      { new: true },
    ).exec();
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await hash(newPassword, argon2idOptions);
    return this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true },
    ).exec();
  }

  async updateUser(userId: string, updateData: UpdateUserReqDto): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
  }

  async deleteUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
