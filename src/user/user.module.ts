import { Module } from '@nestjs/common';
import { UserRepository } from '@/user/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UserModule {}
