import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealTimeChatService } from './real-time-chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from '../message/entity/message.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly realTimeChatService: RealTimeChatService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, roomId: string): Promise<void> {
    client.join(roomId);
    client.emit('joined', roomId);
  }

  @SubscribeMessage('leave')
  async handleLeave(client: Socket, roomId: string): Promise<void> {
    client.leave(roomId);
    client.emit('left', roomId);
  }

  @SubscribeMessage('newMessage')
  async handleMessage(
    client: Socket,
    @MessageBody()
    data: { senderId: string; recipientId: string; message: string },
  ) {
    const { senderId, recipientId, message } = data;
    console.log(senderId, recipientId, message);
    const savedMessage = await this.realTimeChatService.saveMessage(
      senderId,
      recipientId,
      message,
    );

    return this.server.to(recipientId).emit('onMessage', savedMessage);
  }
}
