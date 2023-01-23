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
      relations: ['members'],
    });

    return communities.map((c) => {
      delete c.author.password;
      c.members.map((m) => {
        delete m.password;
        return m;
      });
      return c;
    });
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

    const find = await this.communityRepository.findOne({
      where: { id: community.id },
      relations: ['members'],
    });

    delete find.author.password;

    return find;
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
}
