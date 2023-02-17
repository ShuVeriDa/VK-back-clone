import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity } from './entity/video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoService {
  @InjectRepository(VideoEntity)
  private readonly videoRepository: Repository<VideoEntity>;

  async getAll() {
    const video = await this.videoRepository.find({
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return video;
  }
}
