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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll() {
    const users = await this.userRepository.find({
      relations: ['friends.friend'],
    });

    return users.map((user) => {
      user.friends.map((friend) => {
        delete friend.friend.password;
        return friend;
      });
      delete user.password;
      delete user.favorites;
      return user;
    });
    // const qb = this.userRepository.createQueryBuilder('u');
    //
    // const arr = await qb
    //   // .leftJoinAndSelect('u.posts', 'posts')
    //   // .leftJoinAndSelect('u.comments', 'comments')
    //   // .leftJoinAndSelect('u.reposts', 'reposts')
    //   .leftJoinAndSelect('u.friends', 'friends')
    //   .getMany();
    //
    // return arr.map((obj) => {
    //   delete obj.password;
    //   return {
    //     ...obj,
    //   };
    // });
  }

  async getById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    delete user.password;
    delete user.favorites;
    return user;
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

    return this.getById(userIdToChange);
  }

  async removeUser(userIdToChange: string, userId: string) {
    if (userIdToChange !== String(userId))
      throw new ForbiddenException("You don't have access");

    return this.userRepository.delete({ id: userIdToChange });
  }

  async addFriend(friendId: string, userId: string) {
    const friend = await this.userRepository.findOne({
      where: { id: friendId },
      relations: ['newFriends'],
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['newFriends'],
    });

    const newFriend = await this.userRepository.save({
      ...user,
      newFriends: [...user.newFriends, friend],
    });

    return newFriend;
  }
}
