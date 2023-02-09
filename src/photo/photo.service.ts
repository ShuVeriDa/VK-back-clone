import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class PhotoService {
  @InjectRepository(PhotoEntity)
  private readonly photoRepository: Repository<PhotoEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async getAll() {
    const photos = await this.photoRepository.find({
      order: { createdAt: 'DESC' },
    });

    return photos;
  }

  async getOne(photoId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
      relations: ['communities'],
    });

    if (!photo) throw new NotFoundException('Photo not found');

    delete photo.user.password;

    return photo;
  }

  async create(dto: CreatePhotoDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const photo = await this.photoRepository.save({
      user: { id: userId },
    });

    return this.getOne(photo.id);
  }
}
