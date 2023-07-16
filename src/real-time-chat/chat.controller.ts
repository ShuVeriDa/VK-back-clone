import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeEntity } from './entity/realtime.entity';

@Controller('chat')
export class MessagesController {
  constructor(
    @InjectRepository(RealtimeEntity)
    private readonly messageRepository: Repository<RealtimeEntity>,
  ) {}

  @Get()
  async findAll(): Promise<RealtimeEntity[]> {
    return this.messageRepository.find();
  }

  @Post()
  async create(@Body() messageData: RealtimeEntity): Promise<RealtimeEntity> {
    const newMessage = this.messageRepository.create(messageData);
    return this.messageRepository.save(newMessage);
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<RealtimeEntity> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }
}
