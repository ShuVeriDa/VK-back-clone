import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicEntity } from './entity/music.entity';
import { Repository } from 'typeorm';
import { CreateMusicDto } from './dto/create.dto';
import { UpdateMusicDto } from './dto/update.dto';
import { UserEntity } from '../user/entity/user.entity';
import { SearchMusicDto } from './dto/search.dto';
import { addAndRemoveAdderMusic } from '../components/forServices/addAndRemoveAdderMusic';
import { CommunityEntity } from '../community/entity/community.entity';

@Injectable()
export class MusicService {
  @InjectRepository(MusicEntity)
  private readonly musicRepository: Repository<MusicEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

  async getAll() {
    const music = await this.musicRepository.find();

    music.map((music) => {
      delete music.user.password;

      music.musicAdders.map((m) => {
        delete m.password;
        return m;
      });

      return music;
    });

    return music;
  }

  async getMyMusic(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['music'],
    });

    user.music.map((music) => {
      delete music.user.password;

      music.musicAdders.map((adder) => {
        delete adder.password;
        return adder;
      });

      return music;
    });

    return user.music;
  }

  async search(dto: SearchMusicDto) {
    const qb = this.musicRepository.createQueryBuilder('music');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 100);

    if (dto.title) {
      qb.andWhere('music.title ILIKE :title');
    }

    if (dto.artist) {
      qb.andWhere('music.artist ILIKE :artist');
    }

    qb.setParameters({
      title: `%${dto.title}%`,
      artist: `%${dto.artist}%`,
    });

    const [music, total] = await qb
      .leftJoinAndSelect('music.user', 'user')
      .leftJoinAndSelect('music.musicAdders', 'musicAdders')
      .getManyAndCount();

    music.map((music) => {
      delete music.user.password;

      music.musicAdders.map((music) => {
        delete music.password;
        return music;
      });
      return music;
    });

    return { music, total };
  }

  async getOne(musicId: string) {
    const music = await this.musicRepository.findOne({
      where: { id: musicId },
      relations: ['communities'],
    });

    if (!music) throw new NotFoundException('Music not found');

    delete music.user.password;

    music.musicAdders.map((m) => {
      delete m.password;
      return m;
    });

    return music;
  }

  async create(dto: CreateMusicDto, userId: string) {
    const newMusic = await this.musicRepository.save({
      musicUrl: dto.musicUrl,
      user: { id: userId },
      musicAdders: [{ id: userId }],
    });

    const music = await this.musicRepository.findOne({
      where: { id: newMusic.id },
    });

    delete music.user.password;
    music.musicAdders.map((m) => {
      delete m.password;
      return m;
    });

    return music;
  }

  async update(dto: UpdateMusicDto, musicId: string, userId: string) {
    const music = await this.getOne(musicId);

    const isAuthor = music.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this message");

    await this.musicRepository.update(
      { id: music.id },
      {
        title: dto.title,
        artist: dto.artist,
      },
    );

    return await this.getOne(music.id);
  }

  async delete(musicId: string, userId: string) {
    const music = await this.getOne(musicId);

    const isAuthor = music.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this message");

    return await this.musicRepository.delete(music.id);
  }

  async addMusic(musicId: string, userId: string) {
    return await addAndRemoveAdderMusic(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      this.getOne(musicId),
      'add',
    );
  }

  async removeFromAdders(musicId: string, userId: string) {
    return await addAndRemoveAdderMusic(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      this.getOne(musicId),
      'remove',
    );
  }

  //for community
  async createInCommunity(dto: CreateMusicDto, userId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['music', 'admins'],
    });

    if (!community)
      throw new NotFoundException(
        `Community with id ${dto.communityId} not found`,
      );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const isAdmin = community.admins.find((admin) => admin.id === user.id);

    if (!isAdmin) throw new ForbiddenException('You have no rights!');

    const music = await this.musicRepository.save({
      musicUrl: dto.musicUrl,
      user: { id: user.id },
      communities: [{ id: community.id }],
    });

    return await this.getOne(music.id);
  }
}
