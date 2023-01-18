import { Repository } from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { NotFoundException } from '@nestjs/common';

export const getOnePost = async (
  id: string,
  postRepos: Repository<PostEntity>,
) => {
  const post = await postRepos.findOneBy({ id });

  if (!post) throw new NotFoundException('Post not found');

  await postRepos
    .createQueryBuilder('posts')
    .whereInIds(id)
    .update()
    .set({ views: () => 'views + 1' })
    .execute();

  delete post.user.password;
  delete post.user.createdAt;
  delete post.user.updatedAt;

  return post;
};
