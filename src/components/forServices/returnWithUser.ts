import { PostEntity } from '../../post/entity/post.entity';

export const returnWithUser = (thing: PostEntity) => {
  return {
    ...thing,
    user: {
      id: thing.user.id,
      firstName: thing.user.firstName,
      lastName: thing.user.lastName,
      avatar: thing.user.avatar,
    },
  };
};
