import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { CommunityEntity } from '../../community/entity/community.entity';

export const getOnePostInCommunity = async (
  postId: string,
  postRepos: Repository<PostEntity>,
  communityId: string,
  communityRepos: Repository<CommunityEntity>,
) => {
  const post = await postRepos.findOne({
    where: { id: postId },
    relations: ['community', 'community.admins'],
  });

  if (!post) throw new NotFoundException('Post not found');

  const community = await communityRepos.findOne({
    where: { id: communityId },
    relations: ['members', 'posts'],
  });

  if (!community)
    throw new NotFoundException(`Community with id ${communityId} not found`);

  const isExistPost = community.posts.find((post) => post.id === postId);

  if (!isExistPost)
    throw new NotFoundException('Post not found in this community');

  delete post.user.password;
  // delete post.community.author.password;
  // post.community.members.map((m) => {
  //   delete m.password;
  //   return m;
  // });
  return { post };
};
