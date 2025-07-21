import { SignInReqDto, SignInResDto, SignUpReqDto } from '@dtos/auth.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
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

  async signUp(user: SignUpReqDto): Promise<SignInResDto> {
    try {
      // Find if there is an existing user
      const existingUser = await this.userRepository.findUserByUsername(user.username);
      if (existingUser !== null) {
        throw new Error('Username already exists');
      }

      // Create a new user
      const newUser = await this.userRepository.createUser({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        teamId: user.teamId,
        password: user.password,
      });

      // Return the access token for the new user
      await this.userRepository.markAsLoggedIn(newUser.username);
      return await this.createAccessToken(newUser.username, newUser._id!.toString());
    }
    catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
