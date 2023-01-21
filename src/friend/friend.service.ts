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
import { findIndex } from 'rxjs';

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
      relations: ['friend', 'user'],
    });

    return friends.map((obj) => {
      delete obj.friend.password;
      delete obj.user.password;

      return obj;
    });
  }

  async getOneById(id: string, userId: string) {
    const find = await this.friendRepository.findOne({
      where: { id: id },
      relations: ['friend', 'user'],
    });
    // if (find.user.id !== userId) {}

    if (id === String(userId)) {
      throw new NotFoundException(
        "Friend not found because you can't add yourself as a friend",
      );
    }

    if (find?.user.id !== userId) {
      throw new NotFoundException('Friend not Found');
    }

    delete find.friend.password;
    delete find.user;
    return find;
  }

  async addFriend(friendId: string, userId: string) {
    const userExist = await this.userRepository.findOneBy({ id: userId });
    const friendExist = await this.userRepository.findOneBy({ id: friendId });
    if (!userExist || !friendExist) {
      throw new HttpException(
        'Invalid user or friend id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (friendId === String(userId)) {
      throw new HttpException(
        "Friend not found because you can't add yourself as a friend",
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend'],
    });

    const isFriendExist = user.friends.find(
      (obj) => String(obj?.friend.id) === friendId,
    );

    if (isFriendExist) {
      throw new HttpException(
        'Friendship already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newFriend = await this.friendRepository.save({
      user: { id: userId },
      friend: { id: friendId },
    });

    const friend = await this.friendRepository.findOne({
      where: { id: newFriend.id },
      // relations: ['friend', 'user'],
      relations: ['friend'],
    });

    delete friend.id;
    delete friend.friend.password;
    // delete find.user;
    return friend;
  }
}
