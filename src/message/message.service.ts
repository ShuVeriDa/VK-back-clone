import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create.dto';

@Injectable()
export class MessageService {
  @InjectRepository(MessageEntity)
  private readonly messageRepository: Repository<MessageEntity>;

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
