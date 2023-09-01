import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealtimeEntity } from './entity/realtime.entity';
import { ChatDto } from './dto/chat.dto';
import { UserEntity } from '../user/entity/user.entity';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(RealtimeEntity)
    private readonly messageRepository: Repository<RealtimeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
  // @Auth('user')
  // @AuthWebSocket()
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ChatDto,
  ): Promise<void> {
    console.log(`Received message: ${dto.message}`);

    const user = client.user; // Assuming the user property is set during WebSocket authentication

    const message = this.messageRepository.create({
      message: dto.message,
      sender: { id: '4' },
      recipient: { id: dto.receiverId },
    });

    const savedMessage = await this.messageRepository.save(message);

    this.server.emit('onMessage', savedMessage);
  }
}
