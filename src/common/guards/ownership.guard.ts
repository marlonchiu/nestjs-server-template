import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const CHECK_OWNERSHIP_KEY = 'checkOwnership';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const checkOwnership = this.reflector.getAllAndOverride<boolean>(
      CHECK_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!checkOwnership) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    // 如果用户是 admin 角色，允许访问所有资源
    if (user.role === 'admin') {
      return true;
    }

    // 检查用户是否在操作自己的资源
    if (user.sub !== resourceId) {
      throw new ForbiddenException('您没有权限操作此资源');
    }

    return true;
  }
}
