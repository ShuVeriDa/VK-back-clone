import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../../community/entity/community.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';

export const getOnePhotoInCommunity = async (
  photoId: string,
  photoRepos: Repository<PhotoEntity>,
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
) => {
  const photo = await photoRepos.findOne({
    where: { id: photoId },
    relations: ['community', 'community.admins'],
  });

  if (!photo) throw new NotFoundException('Photo not found');

  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members', 'photos'],
  });

  if (!community)
    throw new NotFoundException(`Community with id ${communityId} not found`);

  const isExistPhoto = community.photos.find((p) => p.id === photo.id);

  if (!isExistPhoto)
    throw new NotFoundException('Photo not found in this community');

  delete photo.user.password;
  // delete photo.community.author.password;
  // photo.community.members.map((m) => {
  //   delete m.password;
  //   return m;
  // });
  return { photo };
};
