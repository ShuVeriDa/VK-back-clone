import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { UserEntity } from '../../user/entity/user.entity';

export const validationCommunity = async (
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
  userId?: string,
  userRepos?: Repository<UserEntity>,
) => {
  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members', 'posts'],
  });

  if (!community) {
    throw new NotFoundException('Community not found');
  }

  if (userId && userRepos) {
    const user = await userRepos.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return { community: community, user: user };
  } else {
    return { community: community };
  }
};
