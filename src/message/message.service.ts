import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class MessageService {
  @InjectRepository(MessageEntity)
  private readonly messageRepository: Repository<MessageEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async getAll(userId: string) {
    const messages = await this.messageRepository.find({
      where: { sender: { id: userId } },
    });

    return messages.map((m) => {
      delete m.sender.password;
      delete m.recipient.password;
      return m;
    });
  }

  async getAllByRecipientId(recipientId: string, userId: string) {
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!recipient) throw new NotFoundException('Recipient not found');

    const myMessages = await this.messageRepository.find({
      where: { recipient: { id: recipientId }, sender: { id: userId } },
    });

    const hisMessages = await this.messageRepository.find({
      where: { recipient: { id: userId }, sender: { id: recipientId } },
    });

    myMessages.map((m) => {
      delete m.sender.password;
      delete m.recipient.password;
      return m;
    });

    hisMessages.map((m) => {
      delete m.sender.password;
      delete m.recipient.password;
      return m;
    });

    const allOurSorteredMessages = myMessages
      .concat(hisMessages)
      .sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        if (a.createdAt < b.createdAt) return -1;
        return 0;
      });

    return allOurSorteredMessages;
  }

  async getOneById(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');

    if (message.sender.id !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    delete message.sender.password;
    delete message.recipient.password;

    return message;
  }

  async create(dto: CreateMessageDto, userId: string) {
    const createMessage = await this.messageRepository.save({
      message: dto.message,
      sender: { id: userId },
      recipient: { id: dto.recipientId },
    });

    const message = await this.messageRepository.findOne({
      where: { id: createMessage.id },
      relations: ['sender', 'recipient'],
    });

    delete message.recipient.password;
    delete message.sender.password;

    return message;
  }
}
