import { Repository } from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { NotFoundException } from '@nestjs/common';

export const getOnePost = async (
  id: string,
  postRepos: Repository<PostEntity>,
  userId?: string,
) => {
  const post = await postRepos.findOne({
    where: { id },
    relations: ['community'],
  });

  if (!post) throw new NotFoundException('Post not found');

  await postRepos
    .createQueryBuilder('posts')
    .whereInIds(id)
    .update()
    .set({ views: () => 'views + 1' })
    .execute();

  return post;
};
