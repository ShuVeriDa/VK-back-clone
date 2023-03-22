import { validationCRUDInCommunity } from './validationCRUDInCommunity';
import { ForbiddenException } from '@nestjs/common';
import { FetchVideoDto } from '../../video/dto/fetch.dto';
import { Repository } from 'typeorm';
import { VideoEntity } from '../../video/entity/video.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { CommunityEntity } from '../../community/entity/community.entity';

export const addAndRemoveVideoInCommunity = async (
  dto: FetchVideoDto,
  videoId: string,
  videoRepos: Repository<VideoEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  communityRepos: Repository<CommunityEntity>,
  getOne: any,
  flag?: 'add' | 'remove',
) => {
  const { community } = await validationCRUDInCommunity(
    dto.communityId,
    communityRepos,
    userId,
    userRepos,
  );

  const video = await getOne;

  const isAdd = community.video.find((v) => v.id === video.id);

  if (flag === 'add') {
    if (isAdd)
      throw new ForbiddenException('The community already has this video.');

    community.video.push(video);
    await communityRepos.save(community);
  }

  if (flag === 'remove') {
    if (!isAdd)
      throw new ForbiddenException('The community no longer has this video.');

    community.video = community.video.filter((v) => v.id !== video.id);
    await communityRepos.save(community);
  }
};
