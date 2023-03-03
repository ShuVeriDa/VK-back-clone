import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from '../../post/entity/post.entity';
import { getOnePost } from './getOnePost';

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

    if (isNotFavorites) {
      user.favorites.push(post);
      post.favorites++;
      await userRepos.save(user);
      await postRepos.save(post);
    }
  }

  if (title === 'reposts') {
    const isNotFavorites =
      user.reposts.findIndex((obj) => obj.id === post.id) === -1;

    if (isNotFavorites) {
      user.reposts.push(post);
      post.reposts++;
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
