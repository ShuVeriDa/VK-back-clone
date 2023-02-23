import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MusicEntity } from '../../music/entity/music.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { VideoEntity } from '../../video/entity/video.entity';

export const addAndRemoveAdderVideo = async (
  videoId: string,
  videoRepos: Repository<VideoEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  getOne: any,
  flag?: 'add' | 'remove',
) => {
  const video = await getOne;

  const user = await userRepos.findOne({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  delete user.password;

  const isAdd = video.videoAdders.find((adder) => adder.id === user.id);

  if (flag === 'add') {
    if (isAdd) throw new ForbiddenException('The user already has this video.');

    await videoRepos.save({
      ...video,
      videoAdders: [...video.videoAdders, user],
    });
  }

  if (flag === 'remove') {
    if (!isAdd)
      throw new ForbiddenException('The user no longer has this video.');

    video.videoAdders = video.videoAdders.filter(
      (adder) => adder.id !== user.id,
    );
    await videoRepos.save(video);
  }

  return await getOne;
};
