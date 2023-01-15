import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '../../user/entity/user.entity';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requser = context.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = requser.user;

    if (!user.isAdmin) throw new ForbiddenException('You have no rights!');

    return user.isAdmin;
  }
}
