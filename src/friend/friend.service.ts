import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendEntity } from './entity/friend.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendEntity)
    private readonly friendRepository: Repository<FriendEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  //all
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

  async getById(id: string, userId: string) {
    const find = await this.friendRepository.findOne({
      where: { id: id },
      relations: ['friend', 'user'],
    });

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

  //Current User
  async getAllFriends(userId: string) {
    const friends = await this.userRepository.find({
      where: { id: userId },
      relations: ['friends.friend', 'friends.user'],
    });

    return friends.map((obj) => {
      const { friends } = obj;
      friends.map((obj) => {
        delete obj.user.password;
        delete obj.friend.password;
        return obj;
      });

      return friends;
    });
  }

  async getOneFriendById(friendId: string, userId: string) {
    const userExist = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend', 'friends.user'],
    });
    const friendExist = await this.userRepository.findOneBy({ id: friendId });

    if (!userExist || !friendExist) {
      throw new HttpException(
        'Invalid user or friend id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const friend = userExist.friends.find(
      (obj) => String(obj.friend.id) === friendId,
    );

    if (!friend) {
      throw new NotFoundException('Friend not found');
    }

    delete friend.friend.password;
    delete friend.user.password;

    return friend;
  }

  async addFriend(friendId: string, userId: string) {
    const userExist = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends', 'friends.friend'],
    });
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

    const isFriendExist = userExist.friends.find(
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
