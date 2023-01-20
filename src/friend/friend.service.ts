import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getAll() {
    const friends = await this.friendRepository.find({
      relations: ['friend'],
    });

    return friends.map((obj) => {
      delete obj.friend.password;
      delete obj.id;

      return obj;
    });
  }

  async addFriend(friendId: string, userId: string) {
    const friendExist = await this.friendRepository.findOneBy({ id: friendId });

    if (friendExist) {
      throw new HttpException(
        'Invalid user or friend id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (friendId === String(userId)) {
      throw new HttpException(
        'Friendship already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newFriend = await this.friendRepository.save({
      id: friendId,
      user: { id: userId },
      friend: { id: friendId },
    });

    const find = await this.friendRepository.findOne({
      where: { id: newFriend.id },
      // relations: ['friend', 'user'],
      relations: ['friend'],
    });

    delete find.id;
    delete find.friend.password;
    // delete find.user;
    return find;
  }
}
