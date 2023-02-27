import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { VideoEntity } from '../../video/entity/video.entity';

export const getOneVideoInCommunity = async (
  videoId: string,
  videoRepos: Repository<VideoEntity>,
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
) => {
  const video = await videoRepos.findOne({
    where: { id: videoId },
    relations: ['communities', 'communities.admins'],
  });

  if (!video) throw new NotFoundException('Video not found');

  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members', 'photos', 'video'],
  });

  if (!community)
    throw new NotFoundException(`Community with id ${communityId} not found`);

  const isExistVideo = community.video.find((p) => p.id === video.id);

  if (!isExistVideo)
    throw new NotFoundException('Video not found in this community');

  delete video.user.password;

  return { video };
};
