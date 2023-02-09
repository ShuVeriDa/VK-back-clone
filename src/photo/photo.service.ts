import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { UpdatePhotoDto } from './dto/update.dto';
import * as http from 'http';

@Injectable()
export class PhotoService {
  @InjectRepository(PhotoEntity)
  private readonly photoRepository: Repository<PhotoEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async getAll(userId: string) {
    const photos = await this.photoRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    photos.map((p) => {
      delete p.user.password;
      return p;
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

  async update(dto: UpdatePhotoDto, photoId: string, userId: string) {
    const photo = await this.getOne(photoId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = photo.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this photo");

    await this.photoRepository.update(
      { id: photo.id },
      { description: dto.description },
    );

    return await this.getOne(photo.id);
  }

  async delete(photoId: string, userId: string) {
    const photo = await this.getOne(photoId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = photo.user.id === userId;

    const isCommunity = photo.communities; // null

    if (!isAuthor || isCommunity)
      throw new ForbiddenException("You don't have access to this photo");

    await this.photoRepository.delete(photo.id);
  }
}
