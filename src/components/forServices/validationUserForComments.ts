import { ForbiddenException } from '@nestjs/common';
import { CommentService } from '../../comment/comment.service';

export const validationUserForComments = async (
  id: string,
  userId: string,
  current: CommentService,
  isAdmin?: boolean,
) => {
  const comment = await current.findOneById(id);

  if (comment.user.id !== userId && !isAdmin) {
    throw new ForbiddenException('No access to this comment');
  }
};
