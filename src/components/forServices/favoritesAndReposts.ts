import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from '../../post/entity/post.entity';
import { getOnePost } from './getOnePost';
import { ForbiddenException } from '@nestjs/common';
import { returnWithUser } from './returnWithUser';

export const favoritesAndReposts = async (
  id: string,
  userId: string,
  title: 'favorites' | 'reposts',
  postRepos: Repository<PostEntity>,
  userRepos: Repository<UserEntity>,
) => {
  const post = await getOnePost(id, postRepos);

  const user = await userRepos.findOne({
    where: { id: userId },
    relations: [title],
  });

  if (title === 'favorites') {
    const isNotFavorites =
      user.favorites.findIndex((obj) => obj.id === post.id) === -1;

    if (!isNotFavorites)
      throw new ForbiddenException('The post is already in favorites');

    if (isNotFavorites) {
      user.favorites.push(post);
      post.favorites++;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  if (title === 'reposts') {
    const isNotReposts =
      user.reposts.findIndex((obj) => obj.id === post.id) === -1;

    if (!isNotReposts)
      throw new ForbiddenException('The post already reposted');

    if (isNotReposts) {
      user.reposts.push(post);
      post.reposts++;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  return returnWithUser(post);
};
