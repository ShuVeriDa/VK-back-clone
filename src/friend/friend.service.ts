import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendEntity } from './entity/friend.entity';
import { Repository } from 'typeorm';
import { FriendDto } from './dto/friend.dto';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async addFriend(friendId: string, userId: string) {
    const newFriend = await this.friendRepository.save({
      id: friendId,
      user: { id: userId },
      friend: { id: friendId },
    });

    const find = await this.friendRepository.findOne({
      where: { id: newFriend.id },
      relations: ['friend', 'user'],
    });

    delete find.id;
    delete find.friend.password;
    return find;
  }
}
