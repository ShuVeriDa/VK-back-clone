import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from '../../post/entity/post.entity';
import { getOnePost } from './getOnePost';
import { ForbiddenException } from '@nestjs/common';
import { returnPostPhotoForCommunity } from './returnPostPhotoForCommunity';

export const removeFromFavoritesAndReposts = async (
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
    const postIndex = user.favorites.findIndex((obj) => obj.id === post.id);

    if (postIndex < 0)
      throw new ForbiddenException('The post is no longer in favorites');

    if (postIndex >= 0) {
      user.favorites.splice(postIndex, 1);
      post.favorites--;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  if (title === 'reposts') {
    const postIndex = user.reposts.findIndex((obj) => obj.id === post.id);

    if (postIndex < 0)
      throw new ForbiddenException('The post is no longer reposted');

    if (postIndex >= 0) {
      user.reposts.splice(postIndex, 1);
      post.reposts--;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  return returnPostPhotoForCommunity(post);
};
