import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update.dto';
import { returnUserData } from '../components/forServices/returnUserData';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll() {
    const users = await this.userRepository.find({
      relations: ['friends.friend', 'newFriends'],
    });

    return users.map((user) => {
      const friends = user.newFriends.map((friend) => {
        return returnUserData(friend);
      });

      return {
        ...user,
        newFriends: friends,
      };
    });
  }

  async getById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['newFriends'],
    });
    if (!user) throw new NotFoundException('User not found');

    const friends = user.newFriends.map((friend) => {
      return returnUserData(friend);
    });

    return {
      ...user,
      newFriends: friends,
    };
  }

  async updateUser(userIdToChange: string, userId: string, dto: UpdateUserDto) {
    if (userIdToChange !== String(userId))
      throw new ForbiddenException("You don't have access");

    const user = await this.userRepository.findOneBy({ id: userIdToChange });

    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(
      {
        id: userIdToChange,
      },
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status,
      },
    );

    return await this.getById(userIdToChange);
  }

  async removeUser(userIdToChange: string, userId: string) {
    if (userIdToChange !== String(userId))
      throw new ForbiddenException("You don't have access");

    return this.userRepository.delete({ id: userIdToChange });
  }

  async addFriend(friendId: string, userId: string) {
    const friendExist = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['newFriends'],
    });

    const userExist = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['newFriends'],
    });

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

    const isFriendExist = userExist.newFriends.find(
      (obj) => String(obj?.id) === friendId,
    );

    if (isFriendExist) {
      throw new HttpException(
        'Friendship already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newFriend = await this.userRepository.save({
      ...userExist,
      newFriends: [...userExist.newFriends, friendExist],
    });

    return {
      ...newFriend,
      newFriends: returnUserData(friendExist),
    };
  }
}
