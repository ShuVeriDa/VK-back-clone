import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from '../../post/entity/post.entity';
import { getOnePost } from './getOnePost';

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

    if (postIndex >= 0) {
      user.favorites.splice(postIndex, 1);
      post.favorites--;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  if (title === 'reposts') {
    const postIndex = user.reposts.findIndex((obj) => obj.id === post.id);

    if (postIndex >= 0) {
      user.reposts.splice(postIndex, 1);
      post.reposts--;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  return {
    ...post,
    user: {
      id: post.user.id,
      firstName: post.user.firstName,
      lastName: post.user.lastName,
      avatar: post.user.avatar,
    },
  };
};
