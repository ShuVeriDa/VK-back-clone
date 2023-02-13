import { ForbiddenException } from '@nestjs/common';
import { CommentService } from '../../comment/comment.service';

export const validationUserForComments = async (
  id: string,
  userId: string,
  current: CommentService,
  request: 'PUT' | 'DELETE',
  isAdmin?: boolean,
) => {
  const comment = await current.findOneById(id);

  if (request === 'PUT' && comment.user.id !== userId) {
    throw new ForbiddenException('No access to this comment');
  }

  if (request === 'DELETE' && comment.user.id !== userId && !isAdmin) {
    throw new ForbiddenException('No access to this comment');
  }

  return { comment };
};
