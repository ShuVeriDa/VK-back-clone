import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityEntity } from './entity/community.entity';
import { Repository } from 'typeorm';
import { CreateCommunityDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { subscribeAndUnSubscribe } from '../components/forServices/subscribeAndUnSubscribe';
import { validationCommunity } from '../components/forServices/validationCommunity';
import { AddAdminCommunityDto } from './dto/addAdmin.dto';
import { addAndRemoveAdmin } from '../components/forServices/addAndRemoveAdmin';
import { returnCommunity } from '../components/forServices/returnCommunity';
import { returnVideoForCommunity } from '../components/forServices/returnVideoForCommunity';
import { SearchCommunityDto } from './dto/search.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll() {
    const communities = await this.communityRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['members', 'posts', 'video', 'music', 'photos'],
    });

    return communities.map((c) => {
      return returnCommunity(c);
    });
  }

  async getOne(communityId: string) {
    const { community } = await validationCommunity(
      communityId,
      this.communityRepository,
    );

    return returnCommunity(community);
  }

  async search(dto: SearchCommunityDto) {
    const qb = this.communityRepository.createQueryBuilder('community');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 100);

    if (dto.name) {
      qb.andWhere('community.name ILIKE :name');
    }

    qb.setParameters({
      name: `%${dto.name}%`,
    });

    const [community, total] = await qb.getManyAndCount();

    return { communities: community, total };
  }

  async create(dto: CreateCommunityDto, userId: string) {
    const community = await this.communityRepository.save({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isAdmin: true,
      members: [{ id: userId }],
      admins: [{ id: userId }],
      author: { id: userId },
    });

    return await this.getOne(community.id);
  }

  async delete(communityId: string, userId: string) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const community = await manager.findOne(CommunityEntity, {
        where: { id: communityId },
        relations: [
          'posts',
          'posts.comments',
          'photos',
          'photos.comments',
          'video',
          'video.comments',
          'music',
          'music.comments',
        ],
      });

      if (!community) {
        throw new NotFoundException('Community not found');
      }

      if (String(community.author.id) !== String(userId)) {
        throw new ForbiddenException(
          'This user does not have permission to delete this community',
        );
      }

      const posts = community.posts;
      const music = community.music;
      const photos = community.photos;
      const video = community.video;

      for (const post of posts) {
        for (const comment of post.comments) {
          await manager.remove(comment);
        }
      }

      for (const photo of photos) {
        for (const comment of photo.comments) {
          await manager.remove(comment);
        }
      }

      for (const v of video) {
        for (const comment of v.comments) {
          await manager.remove(comment);
        }
      }

      await manager.remove(music);
      await manager.remove(posts);
      await manager.remove(photos);
      await manager.remove(video);
      await manager.remove(community);
    });

    // const { community } = await validationCommunity(
    //   communityId,
    //   this.communityRepository,
    // );
    //
    // if (String(community.author.id) !== String(userId)) {
    //   throw new ForbiddenException(
    //     'This user does not have permission to delete this community',
    //   );
    // }
    //
    // return this.communityRepository.remove(community);
  }

  async subscribe(communityId: string, userId: string) {
    return await subscribeAndUnSubscribe(
      communityId,
      userId,
      this.communityRepository,
      this.userRepository,
      'subscribe',
    );
  }

  async unsubscribe(communityId: string, userId: string) {
    return await subscribeAndUnSubscribe(
      communityId,
      userId,
      this.communityRepository,
      this.userRepository,
      'unsubscribe',
    );
  }

  async addAdmin(
    dto: AddAdminCommunityDto,
    communityId: string,
    userId: string,
  ) {
    return await addAndRemoveAdmin(
      dto,
      communityId,
      this.communityRepository,
      userId,
      this.userRepository,
      'add',
    );
  }

  async removeFromAdmin(
    dto: AddAdminCommunityDto,
    communityId: string,
    userId: string,
  ) {
    return await addAndRemoveAdmin(
      dto,
      communityId,
      this.communityRepository,
      userId,
      this.userRepository,
      'remove',
    );
  }
}
