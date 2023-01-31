import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommunityService } from '../../community/community.service';

@Injectable()
export class OnlyCommunityAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private communityService: CommunityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const communityId = request.params.id;
    console.log(communityId);
    const community = await this.communityService.getOne(communityId);
    const user = request.user;
    const isAdmin = community.admins.some((admin) => admin.id === user.id);

    if (!isAdmin) throw new ForbiddenException('You have no rights!!!');

    return isAdmin;
  }
}
