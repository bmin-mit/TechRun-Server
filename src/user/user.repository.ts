import { argon2idOptions } from '@common/constant/argon2id-options.const';
import { UserRoleEnum } from '@common/enums/user-role.enum';
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

  async createUser(user: { username: string; fullName: string; teamId?: string; role?: UserRoleEnum; password: string }): Promise<User> {
    user.password = await hash(user.password, argon2idOptions);
    const { teamId, ...userInfo } = user;
    // eslint-disable-next-line new-cap
    const newUser = new this.userModel({ ...userInfo, team: teamId });
    return newUser.save();
  }

  async markAsLoggedIn(username: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { username },
      { lastLogin: new Date() },
      { new: true },
    ).exec();
  }
}
