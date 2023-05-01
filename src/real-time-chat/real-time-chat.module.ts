import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../message/entity/message.entity';
import { UserEntity } from '../user/entity/user.entity';
import { ChatGateway } from './chatGateway';
import { RealTimeChatService } from './real-time-chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, UserEntity]),
    // MessageModule,
    // UserModule,
  ],
  providers: [RealTimeChatService, ChatGateway],
})
export class RealTimeChatModule {}
