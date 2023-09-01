import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';

type TypeData = keyof UserEntity;
export const User = createParamDecorator(
  (data: TypeData, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user[data] : user;
  },
);

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const socket = context.switchToWs().getClient();
    // Проверяем, что пользователь авторизован
    return !!socket.user;
  }
}
