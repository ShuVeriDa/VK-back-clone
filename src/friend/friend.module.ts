import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity } from './entity/friend.entity';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendEntity, UserEntity])],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
