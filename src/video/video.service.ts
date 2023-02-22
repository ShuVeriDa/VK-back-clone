import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity } from './entity/video.entity';
import { Repository } from 'typeorm';
import { CreateVideoDto } from './dto/create.dto';
import { UpdateVideoDto } from './dto/update.dto';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class VideoService {
  @InjectRepository(VideoEntity)
  private readonly videoRepository: Repository<VideoEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

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

  async getMyVideo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['video'],
    });

    if (!user) throw new NotFoundException('User not found');

    const video = await this.videoRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    return video.map((video) => {
      delete video.user.password;

      video.videoAdders.map((adder) => {
        delete adder.password;
        return adder;
      });

      return video;
    });
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

  async update(dto: UpdateVideoDto, videoUrl: string, userId: string) {
    const video = await this.getOne(videoUrl);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isAuthor = video.user.id === user.id;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this video");

    await this.videoRepository.update(
      { id: video.id },
      {
        title: dto.title,
        description: dto.description,
      },
    );

    return await this.getOne(video.id);
  }
}
