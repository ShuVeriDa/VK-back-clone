import { Injectable, NotFoundException } from '@nestjs/common';
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
    const users = await this.userRepository.find();

    return users.map((user) => {
      delete user.password;
      delete user.favorites;
      return user;
    });
  }

  async getById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    delete user.password;
    return user;
  }

  async updateUser(userIdToChange: string, userId: string, dto: UpdateUserDto) {
    if (userIdToChange !== String(userId))
      throw new Error("You don't have access");

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
}
