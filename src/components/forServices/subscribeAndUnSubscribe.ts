import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { ForbiddenException } from '@nestjs/common';
import { validationCommunity } from './validationCommunity';
import { returnCommunity } from './returnCommunity';

export const subscribeAndUnSubscribe = async (
  communityId: string,
  userId: string,
  communityRepos: Repository<CommunityEntity>,
  userRepos: Repository<UserEntity>,
  flag: 'subscribe' | 'unsubscribe',
) => {
  const { community, user } = await validationCommunity(
    communityId,
    communityRepos,
    userId,
    userRepos,
  );

  const isMember = community.members.find(
    (c) => String(c.id) === String(userId),
  );

  if (flag === 'subscribe') {
    if (isMember) {
      throw new ForbiddenException(
        'This user already exists in this community',
      );
    }

    await communityRepos.save({
      ...community,
      members: [...community.members, { id: user.id }],
    });
  }

  if (flag === 'unsubscribe') {
    if (!isMember) {
      throw new ForbiddenException(
        'This user does not exist in this community',
      );
    }
    community.members = community.members.filter(
      (member) => member.id !== user.id,
    );
    await communityRepos.save(community);
  }

  const existCommunity = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members'],
  });

  return returnCommunity(existCommunity);
};
