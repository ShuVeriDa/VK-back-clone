import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validationCommunity } from './validationCommunity';

export const subscribeAndUnSubscribe = async (
  communityId: string,
  userId: string,
  communityRepos: Repository<CommunityEntity>,
  userRepos: Repository<UserEntity>,
  flag: 'subscribe' | 'unsubscribe',
) => {
  // const community = await communityRepos.findOne({
  //   where: { id: communityId },
  //   relations: ['members'],
  // });
  //
  // if (!community) {
  //   throw new NotFoundException(`Community with id ${communityId} not found`);
  // }
  //
  // const user = await userRepos.findOneBy({ id: userId });
  // if (!user) {
  //   throw new NotFoundException(`User with id ${userId} not found`);
  // }

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

  existCommunity.members.map((m) => {
    delete m.password;
    return m;
  });

  return existCommunity;
};
