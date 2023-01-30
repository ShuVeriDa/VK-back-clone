import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommunityEntity } from './entity/community.entity';
import { Repository } from 'typeorm';
import { CreateCommunityDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { subscribeAndUnSubscribe } from '../components/forServices/subscribeAndUnSubscribe';
import { validationCommunity } from '../components/forServices/validationCommunity';

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
      relations: ['members', 'posts'],
    });

    return communities.map((c) => {
      delete c.author.password;
      c.members.map((m) => {
        delete m.password;
        return m;
      });
      c.posts.map((p) => {
        delete p.user.password;
        return p;
      });
      return c;
    });
  }

  async getOne(communityId: string) {
    const { community } = await validationCommunity(
      communityId,
      this.communityRepository,
    );

    community.members.map((m) => {
      delete m.password;
      return m;
    });
    community.posts.map((p) => {
      delete p.user.password;
      return p;
    });

    delete community.author.password;

    return community;
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

    const existedCommunity = await this.communityRepository.findOne({
      where: { id: community.id },
      relations: ['members', 'admins'],
    });

    existedCommunity.members.map((m) => {
      delete m.password;
      return m;
    });

    existedCommunity.admins.map((m) => {
      delete m.password;
      return m;
    });

    delete existedCommunity.author.password;

    return existedCommunity;
  }

  async delete(communityId: string, userId: string) {
    const { community } = await validationCommunity(
      communityId,
      this.communityRepository,
    );

    if (String(community.author.id) !== String(userId)) {
      throw new ForbiddenException(
        'This user does not have permission to delete this community',
      );
    }

    return this.communityRepository.remove(community);
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
}
