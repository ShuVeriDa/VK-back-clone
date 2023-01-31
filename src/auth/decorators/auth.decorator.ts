import { TypeRole } from '../auth.type';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { OnlyCommunityAdminGuard } from '../guards/communityAdmin.guard';

export function Auth(role: TypeRole = 'user') {
  return applyDecorators(
    role === 'admin'
      ? UseGuards(JwtAuthGuard, OnlyAdminGuard)
      : UseGuards(JwtAuthGuard),
  );
}
