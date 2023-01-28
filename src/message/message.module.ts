import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
