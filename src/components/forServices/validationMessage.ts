import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../message/entity/message.entity';

export const validationMessage = async (
  messageIdOrRecipientId: string,
  messageRepos: Repository<MessageEntity>,
) => {
  const find = await messageRepos.findOne({
    where: { id: messageIdOrRecipientId },
  });

  if (!find) throw new NotFoundException(`Message not found`);

  return { message: find };
};
