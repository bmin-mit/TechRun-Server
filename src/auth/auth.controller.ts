import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { SignInReqDto, SignInResDto } from '@/dtos/auth.dto';
import { CreateUserWithoutRoleReqDto } from '@/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, type: () => SignInResDto })
  @ApiResponse({ status: 401, type: () => UnauthorizedException })
  @Post('sign-in')
  async signIn(@Body()user: SignInReqDto): Promise<SignInResDto> {
    return await this.authService.signIn(user);
  }

  @ApiResponse({ status: 201, type: () => SignInResDto })
  @ApiResponse({ status: 401, type: () => UnauthorizedException })
  @Post('sign-up')
  async signUp(@Body() user: CreateUserWithoutRoleReqDto): Promise<SignInResDto> {
    return await this.authService.signUp(user);
  }
}
