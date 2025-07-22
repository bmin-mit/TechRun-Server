import { CanActivate, ExecutionContext, Injectable, Logger, mixin, Type, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserRoleEnum } from '@/common/enums/user-role.enum';
import { UserRepository } from '@/user/user.repository';

export function AuthWsGuard(...roles: UserRoleEnum[]): Type<CanActivate> {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly userRepository: UserRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const client = context.switchToWs().getClient<Socket>();
      try {
        const token = this.extractTokenFromHeader(client);

        if (!token) {
          throw new UnauthorizedException('Missing authentication token');
        }

        const tokenData: { sub: string } = await this.jwtService.verifyAsync(token);
        const user = await this.userRepository.findUserById(tokenData.sub);

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Check roles only if roles were specified
        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new UnauthorizedException('Insufficient permissions');
        }

        // Initialize data object if it doesn't exist
        client.data = client.data || {};
        // Store user data in socket connection
        client.data.user = user;
        return true;
      }
      catch (error) {
        Logger.error(`WebSocket authentication error: ${error.message}`);
        throw new UnauthorizedException();
      }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
      const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  return mixin(AuthGuardMixin);
}
