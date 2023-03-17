import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity } from './entity/friend.entity';
import { UserEntity } from '../../src/user/entity/user.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([FriendEntity, UserEntity])],
//   controllers: [FriendController],
//   providers: [FriendService],
// })
// export class FriendModule {}
