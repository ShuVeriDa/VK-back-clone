import { CommentEntity } from '../../comment/entity/comment.entity';
import { returnVideoForCommunity } from './returnVideoForCommunity';

export const returnCommentFields = (comment: CommentEntity) => {
  return {
    ...comment,
    user: {
      id: comment.user.id,
      firstName: comment.user.firstName,
      lastName: comment.user.lastName,
      avatar: comment.user.avatar,
    },
    post: comment.post
      ? {
          id: comment.post.id,
          text: comment.post.text,
          imageUrl: comment.post.imageUrl,
          musicUrl: comment.post.musicUrl,
          videoUrl: comment.post.videoUrl,
          views: comment.post.views,
          reposts: comment.post.reposts,
          favorites: comment.post.favorites,
          rating: comment.post.rating,
          turnOffComments: comment.post.turnOffComments,
          createdAt: comment.post.createdAt,
          updatedAt: comment.post.updatedAt,
        }
      : null,
    photo: comment.photo
      ? {
          id: comment.photo.id,
          description: comment.photo.description,
          photoUrl: comment.photo.photoUrl,
          turnOffComments: comment.photo.turnOffComments,
          createdAt: comment.photo.createdAt,
          updatedAt: comment.photo.updatedAt,
        }
      : null,
    video: comment.video
      ? {
          id: comment.video.id,
          title: comment.video.title,
          description: comment.video.description,
          videoUrl: comment.video.videoUrl,
          turnOffComments: comment.video.turnOffComments,
          createdAt: comment.video.createdAt,
          updatedAt: comment.video.updatedAt,
        }
      : null,
  };
};
