import { Injectable, NotFoundException } from '@nestjs/common';
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
      return c;
    });
  }
  async create(dto: CreateCommunityDto, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const community = await this.communityRepository.save({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isAdmin: true,
      // members: [user],
      author: { id: userId },
    });

    const find = await this.communityRepository.findOne({
      where: { id: community.id },
      relations: ['members'],
    });
    // find.members.push(user);
    delete find.author.password;

    // await this.communityRepository.update({ id: find.id }, find);

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
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    community.members = [...community.members, user];
    await this.communityRepository.save(community);

    return await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });
  }
}
