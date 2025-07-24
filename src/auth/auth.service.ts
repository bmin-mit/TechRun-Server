import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInReqDto, SignInResDto } from '@/dtos/auth.dto';
import { TeamRepository } from '@/team/team.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly teamRepository: TeamRepository,
  ) {}

  async createAccessToken(username: string, userId: string): Promise<SignInResDto> {
    return {
      accessToken: await this.jwtService.signAsync({ sub: userId, username }),
    };
  }

  async signIn(user: SignInReqDto): Promise<SignInResDto> {
    try {
      const existingUser = await this.teamRepository.findTeamByUsername(user.username);
      if (existingUser === null) {
        throw new Error('Invalid credentials');
      }

      if (existingUser.password === user.password) {
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
}
