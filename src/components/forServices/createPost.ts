import { returnPostPhotoForCommunity } from './returnPostPhotoForCommunity';
import { Repository } from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { CreatePostDto } from '../../post/dto/create.dto';

export const createPost = async (
  postRepos: Repository<PostEntity>,
  dto: CreatePostDto,
  userId: string,
  communityId?: string,
  reposts?: PostEntity,
) => {
  const post = await postRepos.save({
    text: dto.text,
    imageUrl: dto.imageUrl,
    musicUrl: dto.musicUrl,
    videoUrl: dto.videoUrl,
    turnOffComments: dto.turnOffComments,
    reposts: reposts,
    user: { id: userId },
    community: communityId ? { id: communityId } : null,
  });

  const fetchPost = await postRepos.findOne({
    where: { id: post.id },
    relations: ['community', 'reposts'],
  });

  return returnPostPhotoForCommunity(fetchPost);
};
