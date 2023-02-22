import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity } from './entity/video.entity';
import { Repository } from 'typeorm';
import { CreateVideoDto } from './dto/create.dto';
import { UpdateVideoDto } from './dto/update.dto';

@Injectable()
export class VideoService {
  @InjectRepository(VideoEntity)
  private readonly videoRepository: Repository<VideoEntity>;

  async getAll() {
    const video = await this.videoRepository.find({
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    video.map((video) => {
      delete video.user.password;
      video.videoAdders.map((adder) => {
        delete adder.password;
        return adder;
      });

      return video;
    });

    return video;
  }

  async getOne(videoId: string) {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['communities'],
    });

    if (!video) throw new NotFoundException('Video not found');

    delete video.user.password;

    video?.communities?.map((community) => {
      delete community.members;
      delete community.author;
      community.admins.map((admin) => {
        delete admin.password;
        return admin;
      });

      return community;
    });

    video.videoAdders.map((adder) => {
      delete adder.password;
      return adder;
    });

    return video;
  }

  async create(dto: CreateVideoDto, userId: string) {
    const newVideo = await this.videoRepository.save({
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      user: { id: userId },
      videoAdders: [{ id: userId }],
    });

    const video = await this.videoRepository.findOne({
      where: { id: newVideo.id },
    });

    delete video.user.password;

    video.videoAdders.map((video) => {
      delete video.password;
      return video;
    });

    return video;
  }

  // async update(dto: UpdateVideoDto, videoUrl: string, userId: string) {}
}
