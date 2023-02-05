import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MusicEntity } from '../../music/entity/music.entity';
import { UserEntity } from '../../user/entity/user.entity';

export const addAndRemoveAdderMusic = async (
  musicId: string,
  musicRepos: Repository<MusicEntity>,
  userId: string,
  userRepos: Repository<UserEntity>,
  getOne: any,
  flag?: 'add' | 'remove',
) => {
  const music = await getOne;

  const user = await userRepos.findOne({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  delete user.password;

  const isAdd = music.musicAdders.find((music) => music.id === user.id);

  if (flag === 'add') {
    if (isAdd) throw new ForbiddenException('The user already has this music.');

    await musicRepos.save({
      ...music,
      musicAdders: [...music.musicAdders, user],
    });
  }

  if (flag === 'remove') {
    if (!isAdd)
      throw new ForbiddenException('The user no longer has this music.');

    music.musicAdders = music.musicAdders.filter(
      (adder) => adder.id !== user.id,
    );
    await musicRepos.save(music);
  }

  return await getOne;
};
