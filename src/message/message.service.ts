import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  @InjectRepository(MessageEntity)
  private readonly messageRepository: Repository<MessageEntity>;


}
