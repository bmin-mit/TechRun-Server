import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { AuthRequest } from '@/common/interfaces/auth-request.interface';
import {
  AdminUpdateUserPasswordReqDto,
  CreateUserReqDto,
  UpdateUserPasswordDto,
  UpdateUserReqDto,
} from '@/dtos/user.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { UserService } from '@/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @ApiOperation({ description: 'Get my info' })
  @UseGuards(AuthGuard())
  @Get('/me')
  getMyInfo(@Request() req: AuthRequest) {
    return {
      username: req.user.username,
      fullName: req.user.fullName,
      role: req.user.role,
    };
  }

  @ApiOperation({ description: 'Update my user info' })
  @UseGuards(AuthGuard())
  @Put('/me')
  async updateMyInfo(@Request() req: AuthRequest, @Body() body: UpdateUserReqDto) {
    return await this.userService.updateUser(req.user._id!.toString(), body);
  }

  @ApiOperation({ description: 'Update user password' })
  @UseGuards(AuthGuard())
  @Put('/me/update-password/')
  async updateUserPassword(@Body() body: UpdateUserPasswordDto, @Request() req: AuthRequest) {
    await this.userService.updateUserPassword(req.user._id!.toString(), body.oldPassword, body.newPassword);
  }

  @ApiOperation({ description: 'Get all users', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Get('/users')
  async findAllUsers() {
    return await this.userService.findAllUsers();
  }

  @ApiOperation({ description: 'Get user by ID' })
  @UseGuards(AuthGuard())
  @Get('/:id')
  async findUserById(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @ApiOperation({ description: 'Get user by username' })
  @UseGuards(AuthGuard())
  @Get('/username/:username')
  async findUserByUsername(@Param('username') username: string) {
    return await this.userService.findUserByUsername(username);
  }

  @ApiOperation({ description: 'Create new user', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/admin/create')
  async createUser(@Body() body: CreateUserReqDto) {
    return await this.userService.adminCreateUser(body);
  }

  @ApiOperation({ description: 'Admin update user password', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Put('/admin/update-password/:id/')
  async adminUpdateUserPassword(@Param('id') id: string, @Body() body: AdminUpdateUserPasswordReqDto) {
    return await this.userService.adminUpdateUserPassword(id, body.newPassword);
  }

  @ApiOperation({ description: 'Update user', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Put('/admin/update/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserReqDto) {
    return await this.userService.updateUser(id, body);
  }

  @ApiOperation({ description: 'Delete user by ID', tags: ['Admin'] })
  @UseGuards(AuthGuard(UserRoleEnum.ADMIN))
  @Post('/admin/delete/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
