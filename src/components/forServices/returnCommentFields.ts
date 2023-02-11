import { CommentEntity } from '../../comment/entity/comment.entity';

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
      ? { id: comment.post.id, text: comment.post.text }
      : null,
    photo: comment.photo
      ? {
          id: comment.photo.id,
          description: comment.photo.description,
          photoUrl: comment.photo.photoUrl,
        }
      : null,
  };
};
