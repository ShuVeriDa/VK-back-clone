import { validationCRUDInCommunity } from './validationCRUDInCommunity';
import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CommunityEntity } from '../../community/entity/community.entity';
import { MusicEntity } from '../../music/entity/music.entity';

export const addAndRemoveMusicInCommunity = async (
  musicId: string,
  musicRepos: Repository<MusicEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
  getOne: any,
  flag?: 'add' | 'remove',
) => {
  const { community } = await validationCRUDInCommunity(
    communityId,
    communityRepos,
    userId,
    userRepos,
  );

  const music = await getOne;

  const isAdd = community.music.find((v) => v.id === music.id);

  if (flag === 'add') {
    if (isAdd)
      throw new ForbiddenException('The community already has this music.');

    community.music.push(music);
    await communityRepos.save(community);
  }

  if (flag === 'remove') {
    if (!isAdd)
      throw new ForbiddenException('The community no longer has this music.');

    community.music = community.music.filter((v) => v.id !== music.id);
    await communityRepos.save(community);
  }
};
