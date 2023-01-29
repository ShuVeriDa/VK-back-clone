import { Repository } from 'typeorm';
import { MessageEntity } from '../../message/entity/message.entity';

export const markAsRead = async (
  messageId: string,
  messageRepos: Repository<MessageEntity>,
) => {
  await messageRepos.update(
    { id: messageId },
    { read: true, readAt: new Date() },
  );
  const readMessage = await messageRepos.findOne({
    where: { id: messageId },
  });
  delete readMessage.sender.password;
  delete readMessage.recipient.password;
  return readMessage;
};
