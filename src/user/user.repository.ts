import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  // eslint-disable-next-line unused-imports/no-unused-vars
  findUserByUsername(username: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
