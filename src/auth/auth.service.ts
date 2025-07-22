import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { SignInReqDto, SignInResDto } from '@/dtos/auth.dto';
import { CreateUserWithoutRoleReqDto } from '@/dtos/user.dto';
import { UserRepository } from '@/user/user.repository';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
  ) {}

  async createAccessToken(username: string, userId: string): Promise<SignInResDto> {
    return {
      accessToken: await this.jwtService.signAsync({ sub: userId, username }),
    };
  }

  async signIn(user: SignInReqDto): Promise<SignInResDto> {
    try {
      const existingUser = await this.userRepository.findUserByUsername(user.username);
      if (existingUser === null) {
        throw new Error('Invalid credentials');
      }

      if (await verify(existingUser.password, user.password)) {
        await this.userRepository.markAsLoggedIn(existingUser.username);
        return await this.createAccessToken(user.username, existingUser._id!.toString());
      }
      else {
        throw new Error('Invalid credentials');
      }
    }
    catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async signUp(user: CreateUserWithoutRoleReqDto): Promise<SignInResDto> {
    try {
      const newUser = await this.userService.createUser(user);

      // Return the access token for the new user
      await this.userRepository.markAsLoggedIn(newUser.username);
      return await this.createAccessToken(newUser.username, newUser._id!.toString());
    }
    catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
