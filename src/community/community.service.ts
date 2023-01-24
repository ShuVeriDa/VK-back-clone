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
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    delete community.author.password;

    community.members.map((m) => {
      delete m.password;
      return m;
    });

    return community;
  }
  async create(dto: CreateCommunityDto, userId: string) {
    const community = await this.communityRepository.save({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isAdmin: true,
      members: [{ id: userId }],
      author: { id: userId },
    });

    const existedCommunity = await this.communityRepository.findOne({
      where: { id: community.id },
      relations: ['members'],
    });

    delete existedCommunity.author.password;

    return existedCommunity;
  }

  async delete(communityId: string, userId: string) {
    const community = await this.communityRepository.findOneBy({
      id: communityId,
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    if (String(community.author.id) !== String(userId)) {
      throw new ForbiddenException(
        'This user does not have permission to delete this community',
      );
    }

    return this.communityRepository.remove(community);
  }

  async subscribe(communityId: string, userId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    if (!community) {
      throw new NotFoundException(`Community with id ${communityId} not found`);
    }

    const isMember = community.members.find(
      (c) => String(c.id) === String(userId),
    );
    if (isMember) {
      throw new ForbiddenException(
        'This user already exists in this community',
      );
    }

    await this.communityRepository.save({
      ...community,
      members: [...community.members, { id: userId }],
    });

    const existCommunity = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    existCommunity.members.map((m) => {
      delete m.password;
      return m;
    });

    return existCommunity;
  }

  async unsubscribe(communityId: string, userId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    if (!community) {
      throw new NotFoundException(`Community with id ${communityId} not found`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const isMember = community.members.find(
      (c) => String(c.id) === String(userId),
    );
    if (!isMember) {
      throw new ForbiddenException(
        'This user does not exist in this community',
      );
    }

    community.members = community.members.filter(
      (member) => member.id !== user.id,
    );
    await this.communityRepository.save(community);

    const existCommunity = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    existCommunity.members.map((m) => {
      delete m.password;
      return m;
    });

    return existCommunity;
  }
}
