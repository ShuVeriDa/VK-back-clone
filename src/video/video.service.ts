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
import { addAndRemoveAdderMusic } from '../components/forServices/addAndRemoveAdderMusic';
import { FetchVideoDto } from './dto/fetch.dto';
import { validationCommunity } from '../components/forServices/validationCommunity';
import { CommunityEntity } from '../community/entity/community.entity';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';

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
      where: { videoAdders: { id: user.id } },
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
      .getManyAndCount();

    video.map((video) => {
      delete video.user.password;

      video.videoAdders.map((adder) => {
        delete adder.password;
        return adder;
      });
      return video;
    });

    return { video, total };
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
    return await addAndRemoveAdderVideo(
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.getOne(videoId),
      'add',
    );
  }

  async removeFromAdders(videoId: string, userId: string) {
    return await addAndRemoveAdderVideo(
      videoId,
      this.videoRepository,
      userId,
      this.userRepository,
      this.getOne(videoId),
      'remove',
    );
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
      delete v.user.password;

      v.communities.map((community) => {
        community.admins.map((admin) => {
          delete admin.password;
          return admin;
        });

        delete community.author.password;
        delete community.members;

        return community;
      });

      return video;
    });
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
    console.log(community.video);
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
}
