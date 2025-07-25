import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { TeamRepository } from '@/team/team.repository';

export function AuthGuard(...roles: UserRoleEnum[]): Type<CanActivate> {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly teamRepository: TeamRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      try {
        const token = this.extractTokenFromHeader(request);

        if (!token) {
          throw new UnauthorizedException('No token provided');
        }

        const tokenData: { sub: string } = await this.jwtService.verifyAsync(token);
        const user = await this.teamRepository.findTeamById(tokenData.sub);

        if (!user)
          throw new UnauthorizedException('User not found');

        // Admins are always allowed
        if (!roles
          || roles.length === 0
          || (roles.length > 0 && roles.includes(user.role as UserRoleEnum))
          || user.role === UserRoleEnum.ADMIN
        ) {
          request.user = user;
          return true;
        }

        throw new UnauthorizedException('Insufficient permissions');
      }
      catch (error) {
        Logger.error(error);
        throw new UnauthorizedException();
      }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
}
