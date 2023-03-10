import { MessageEntity } from '../../message/entity/message.entity';
import { returnUserData } from './returnUserData';

export const returnMessage = (thing: MessageEntity) => {
  return {
    ...thing,
    sender: returnUserData(thing.sender),
    recipient: returnUserData(thing.recipient),
  };
};
