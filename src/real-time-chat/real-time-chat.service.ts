import { MessageEntity } from '../message/entity/message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { ChatGateway } from './chatGateway';

@Injectable()
export class RealTimeChatService {
  @InjectRepository(MessageEntity)
  private readonly messageRepository: Repository<MessageEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async saveMessage(senderId: string, recipientId: string, message: string) {
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    const newMessage = new MessageEntity();
    newMessage.sender = sender;
    newMessage.recipient = recipient;
    newMessage.message = message;

    const savedMessage = await this.messageRepository.save(newMessage);

    return savedMessage;
  }
}
