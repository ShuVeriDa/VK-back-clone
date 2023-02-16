import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { use } from 'passport';

export const validationCRUDInCommunity = async (
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  isValidation = true,
  isUpdate = false,
  commentUserId?: string,
) => {
  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['music', 'admins', 'members', 'posts', 'photos'],
  });

  if (!community)
    throw new NotFoundException(`Community with id ${communityId} not found`);

  const user = await userRepos.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException(`User with id ${userId} not found`);

  if (isValidation) {
    const isAdmin = community.admins.some((admin) => admin.id === user.id);

    if (!isAdmin) {
      if (commentUserId !== user.id)
        throw new ForbiddenException('You have no rights!');
    }
  }

  if (isUpdate) {
    if (commentUserId !== user.id)
      throw new ForbiddenException('You have no rights!');
  }

  return { community: community, user: user };
};
