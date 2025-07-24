import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { SignInReqDto, SignInResDto } from '@/dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, type: () => SignInResDto })
  @Post('sign-in')
  async signIn(@Body() user: SignInReqDto): Promise<SignInResDto> {
    return await this.authService.signIn(user);
  }
}
