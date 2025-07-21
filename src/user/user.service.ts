import { UserRoleEnum } from '@common/enums/user-role.enum';
import { CreateUserReqDto, CreateUserWithoutRoleReqDto, UpdateUserReqDto } from '@dtos/user.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { verify } from 'argon2';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findAllUsers() {
    return await this.userRepository.findAllUsers();
  }

  async findUserByUsername(username: string) {
    return await this.userRepository.findUserByUsername(username);
  }

  async findUserById(userId: string) {
    return await this.userRepository.findUserById(userId);
  }

  async createUser(createData: CreateUserWithoutRoleReqDto) {
    if (await this.findUserByUsername(createData.username)) {
      throw new Error('User with this username already exists');
    }

    const { isLeader, ...data } = createData;

    return await this.userRepository.createUser({
      ...data,
      role: isLeader ? UserRoleEnum.LEADER : UserRoleEnum.MEMBER,
    });
  }

  async adminCreateUser(createData: CreateUserReqDto) {
    if (await this.findUserByUsername(createData.username)) {
      throw new Error('User with this username already exists');
    }

    return await this.userRepository.createUser({
      username: createData.username,
      fullName: createData.fullName,
      role: createData.role,
      password: createData.password,
    });
  }

  async adminUpdateUserPassword(userId: string, newPassword: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.updateUserPassword(userId, newPassword);
  }

  async updateUserPassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await verify(user.password, oldPassword))) {
      throw new BadRequestException('Old password is incorrect');
    }

    return await this.userRepository.updateUserPassword(userId, newPassword);
  }

  async updateUser(userId: string, updateData: UpdateUserReqDto) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.updateUser(userId, updateData);
  }

  async deleteUser(userId: string) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.deleteUser(userId);
  }
}
