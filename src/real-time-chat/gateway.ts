import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeEntity } from './entity/realtime.entity';
import { ChatDto } from './dto/chat.dto';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(RealtimeEntity)
    private readonly messageRepository: Repository<RealtimeEntity>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('newMessage')
  async handleMessage(client: Socket, dto: ChatDto): Promise<void> {
    console.log(`Received message: ${dto}`);

    const newMessage = this.messageRepository.create({
      content: dto.content,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    this.server.emit('onMessage', savedMessage);
  }

  // @SubscribeMessage('newMessage')
  // onNewMessage(@MessageBody() dto: ChatDto) {
  //   console.log(dto);
  //   this.server.emit('onMessage', {
  //     msg: 'New Message',
  //     content: dto,
  //   });
  // }
}
