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
import { SearchVideoDto } from '../photo/dto/search.dto';
import { addAndRemoveAdderVideo } from '../components/forServices/addAndRemoveAdderVideo';
import { FetchVideoDto } from './dto/fetch.dto';
import { validationCommunity } from '../components/forServices/validationCommunity';
import { CommunityEntity } from '../community/entity/community.entity';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { returnVideoForCommunity } from '../components/forServices/returnVideoForCommunity';
import { addAndRemoveVideoInCommunity } from '../components/forServices/addAndRemoveVideoInCommunity';

@Injectable()
export class VideoService {
  @InjectRepository(VideoEntity)
  private readonly videoRepository: Repository<VideoEntity>;

  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async getAll() {
    const video = await this.videoRepository.find({
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return video.map((v) => {
      return returnVideoForCommunity(v);
    });
  }

  async getMyVideo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['video'],
    });

    if (!user) throw new NotFoundException('User not found');

    const video = await this.videoRepository.find({
      where: { videoAdders: { id: user.id } },
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return video.map((v) => {
      return returnVideoForCommunity(v);
    });
  }

  async search(dto: SearchVideoDto) {
    const qb = this.videoRepository.createQueryBuilder('video');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 100);

    if (dto.title) {
      qb.andWhere('video.title ILIKE :title');
    }

    if (dto.description) {
      qb.andWhere('video.description ILIKE :description');
    }

    qb.setParameters({
      title: `%${dto.title}%`,
      description: `%${dto.description}%`,
    });

    const [video, total] = await qb
      .leftJoinAndSelect('video.user', 'user')
      .leftJoinAndSelect('video.videoAdders', 'videoAdders')
      .leftJoinAndSelect('video.communities', 'communities')
      .getManyAndCount();

    const newVideo = video.map((v) => {
      return returnVideoForCommunity(v);
    });

    return { video: newVideo, total };
  }

  async getOne(videoId: string) {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['communities'],
    });

    if (!video) throw new NotFoundException('Video not found');

    return returnVideoForCommunity(video);
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

    return returnVideoForCommunity(video);
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

  async delete(videoId: string, userId: string) {
    await this.videoRepository.manager.transaction(async (manager) => {
      const video = await manager.findOne(VideoEntity, {
        where: { id: videoId },
        relations: ['communities'],
      });

      if (!video) throw new NotFoundException('Video not found');

      const isCommunity = video.communities.length > 0;

      const isAuthor = video.user.id === userId;

      if (!isAuthor || isCommunity) {
        throw new ForbiddenException("You don't have access to this video");
      }

      const comments = video.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(video);
    });
  }

  async addVideo(videoId: string, userId: string) {
    await addAndRemoveAdderVideo(
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.getOne(videoId),
      'add',
    );

    return this.getOne(videoId);
  }

  async removeFromAdders(videoId: string, userId: string) {
    await addAndRemoveAdderVideo(
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.getOne(videoId),
      'remove',
    );

    return this.getOne(videoId);
  }

  ///////////////
  //FOR COMMUNITY
  //////////////

  async getAllInCommunity(dto: FetchVideoDto) {
    const { community } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    const video = await this.videoRepository.find({
      where: { communities: { id: community.id } },
      relations: ['communities'],
    });

    return video.map((v) => {
      return returnVideoForCommunity(v);
    });
  }

  async getOneInCommunity(dto: FetchVideoDto, videoId: string) {
    const video = await this.getOne(videoId);

    const { community } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    const isExistVideo = community.video.find((v) => v.id === video.id);

    if (!isExistVideo)
      throw new NotFoundException('Video not found in this community');

    return video;
  }

  async createInCommunity(dto: CreateVideoDto, userId: string) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const video = await this.videoRepository.save({
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      user: { id: user.id },
      communities: [{ id: community.id }],
    });

    return await this.getOne(video.id);
  }

  async updateInCommunity(
    dto: UpdateVideoDto,
    videoId: string,
    userId: string,
  ) {
    const { community } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const video = community.video.find((v) => v.id === videoId);

    if (!video)
      throw new NotFoundException('Video not found in this community');

    await this.videoRepository.update(
      {
        id: video.id,
      },
      {
        title: dto.title,
        description: dto.description,
      },
    );

    return await this.getOne(video.id);
  }

  async deleteFromCommunity(
    dto: FetchVideoDto,
    videoId: string,
    userId: string,
  ) {
    await this.videoRepository.manager.transaction(async (manager) => {
      const video = await manager.findOne(VideoEntity, {
        where: { id: videoId },
        relations: ['communities'],
      });

      if (!video) throw new NotFoundException('Video not found');

      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
        true,
      );

      const isVideo = community.video.find((v) => v.id === video.id);

      if (!isVideo)
        throw new NotFoundException('Video not found in this community');

      const comments = video.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(video);
    });
  }

  async addVideoInCommunity(
    dto: FetchVideoDto,
    videoId: string,
    userId: string,
  ) {
    await addAndRemoveVideoInCommunity(
      dto,
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.communityRepository,
      this.getOne(videoId),
      'add',
    );

    return this.getOneInCommunity(dto, videoId);
  }

  async removeVideoInCommunity(
    dto: FetchVideoDto,
    videoId: string,
    userId: string,
  ) {
    await addAndRemoveVideoInCommunity(
      dto,
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.communityRepository,
      this.getOne(videoId),
      'remove',
    );

    return this.getOne(videoId);
  }
}
