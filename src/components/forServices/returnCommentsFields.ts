import { CommentEntity } from '../../comment/entity/comment.entity';

export const returnCommentsFields = (comments: CommentEntity[]) => {
  return comments.map((comment) => {
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
      video: comment.video
        ? {
            id: comment.video.id,
            title: comment.video.title,
            description: comment.video.description,
          }
        : null,
    };
  });
};
