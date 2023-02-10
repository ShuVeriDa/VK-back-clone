import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export const validationCRUDInCommunity = async (
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  isManager = false,
) => {
  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['music', 'admins', 'members', 'posts', 'photos'],
  });

  if (!community)
    throw new NotFoundException(`Community with id ${communityId} not found`);

  const user = await userRepos.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException(`User with id ${userId} not found`);

  if (!isManager) {
    const isAdmin = community.admins.find((admin) => admin.id === user.id);

    if (!isAdmin) throw new ForbiddenException('You have no rights!');
  }

  return { community: community, user: user };
};
