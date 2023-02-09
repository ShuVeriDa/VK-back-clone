import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PhotoService {
  @InjectRepository(PhotoEntity)
  private readonly photoRepository: Repository<PhotoEntity>;

  async getAll() {
    const photos = await this.photoRepository.find({
      order: { createdAt: 'DESC' },
    });

    return photos;
  }
}
