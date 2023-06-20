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
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { FetchMusicDto } from './dto/fetch.dto';
import { validationCommunity } from '../components/forServices/validationCommunity';
import { returnMusicForCommunity } from '../components/forServices/returnMusicForCommunity';
import { addAndRemoveMusicInCommunity } from '../components/forServices/addAndRemoveMusicInCommunity';
import { PlaylistEntity } from './entity/playlist.entity';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';
import { returnUserData } from '../components/forServices/returnUserData';
import { UpdatePlaylistDto } from './dto/updatePlaylist.dto';

@Injectable()
export class MusicService {
  @InjectRepository(MusicEntity)
  private readonly musicRepository: Repository<MusicEntity>;
  @InjectRepository(PlaylistEntity)
  private readonly playlistRepository: Repository<PlaylistEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

  //           //
  // Playlists //
  //           //

  async getAllPlaylist(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const playlist = await this.playlistRepository.find({
      where: { user: { id: user.id } },
      // relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return playlist.map((pl) => {
      return {
        ...pl,
        user: returnUserData(pl.user),
      };
    });
  }

  async getOnePlaylist(playlistId: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['music'],
    });

    if (!playlist) throw new NotFoundException('Playlist not found');

    return {
      ...playlist,
      user: returnUserData(playlist.user),
    };
  }

  async createPlaylist(dto: CreatePlaylistDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const playlist = await this.playlistRepository.save({
      title: dto.title,
      description: dto.description,
      coverUrl: dto.coverUrl,
      music: [] as PlaylistEntity[],
      user: user,
    });

    return {
      ...playlist,
      user: returnUserData(playlist.user),
    };
  }

  async updatePlaylist(
    dto: UpdatePlaylistDto,
    playlistId: string,
    userId: string,
  ) {
    const playlist = await this.getOnePlaylist(playlistId, userId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const isAuthor = playlist.user.id === user.id;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this playlist");

    await this.playlistRepository.update(
      { id: playlist.id },
      {
        title: dto.title,
        description: dto.description,
        coverUrl: dto.coverUrl,
      },
    );

    return await this.getOnePlaylist(playlist.id, userId);
  }

  //       //
  // Music //
  //       //

  async getAll() {
    const music = await this.musicRepository.find({
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return music.map((m) => {
      return returnMusicForCommunity(m);
    });
  }

  async getMyMusic(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['music'],
    });

    if (!user) throw new NotFoundException('User not found');

    const music = await this.musicRepository.find({
      where: { musicAdders: { id: user.id } },
      relations: ['communities'],
      order: { createdAt: 'DESC' },
    });

    return music.map((music) => {
      return returnMusicForCommunity(music);
    });
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
      .leftJoinAndSelect('music.communities', 'communities')
      .getManyAndCount();

    const correctedMusic = music.map((m) => {
      return returnMusicForCommunity(m);
    });

    return correctedMusic;
  }

  async getOne(musicId: string) {
    const music = await this.musicRepository.findOne({
      where: { id: musicId },
      relations: ['communities'],
    });

    if (!music) throw new NotFoundException('Music not found');

    return returnMusicForCommunity(music);
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

    return returnMusicForCommunity(music);
  }

  async update(dto: UpdateMusicDto, musicId: string, userId: string) {
    const music = await this.getOne(musicId);

    const isAuthor = music.user.id === userId;

    if (!isAuthor)
      throw new ForbiddenException("You don't have access to this music");

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
    await this.musicRepository.manager.transaction(async (manager) => {
      const music = await manager.findOne(MusicEntity, {
        where: { id: musicId },
        relations: ['communities'],
      });

      if (!music) throw new NotFoundException('Music not found');

      const isCommunity = music.communities.length > 0;

      const isAuthor = music.user.id === userId;

      if (!isAuthor || isCommunity) {
        throw new ForbiddenException("You don't have access to this music");
      }

      await manager.remove(music);
    });
  }

  async addMusic(musicId: string, userId: string) {
    await addAndRemoveAdderMusic(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      this.getOne(musicId),
      'add',
    );

    return await this.getOne(musicId);
  }

  async removeFromAdders(musicId: string, userId: string) {
    await addAndRemoveAdderMusic(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      this.getOne(musicId),
      'remove',
    );

    return await this.getOne(musicId);
  }

  ///////////////
  //FOR COMMUNITY
  //////////////

  async getAllInCommunity(dto: FetchMusicDto) {
    const { community } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    const music = await this.musicRepository.find({
      where: { communities: { id: community.id } },
      relations: ['communities'],
    });

    return music.map((music) => {
      return returnMusicForCommunity(music);
    });
  }

  async getOneInCommunity(dto: FetchMusicDto, musicId: string) {
    const music = await this.getOne(musicId);

    const { community } = await validationCommunity(
      dto.communityId,
      this.communityRepository,
    );

    const isExistMusic = community.music.find((m) => m.id === m.id);

    if (!isExistMusic)
      throw new NotFoundException('Music not found in this community');

    return returnMusicForCommunity(music);
  }

  async createInCommunity(dto: CreateMusicDto, userId: string) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const isAdmin = community.admins.find((admin) => admin.id === user.id);

    if (!isAdmin) throw new ForbiddenException('You have no rights!');

    const music = await this.musicRepository.save({
      musicUrl: dto.musicUrl,
      user: { id: user.id },
      communities: [{ id: community.id }],
    });

    const isExistMusic = await this.getOne(music.id);

    return returnMusicForCommunity(isExistMusic);
  }

  async updateInCommunity(
    dto: UpdateMusicDto,
    musicId: string,
    userId: string,
  ) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const isExistMusic = community.music.find((music) => music.id === musicId);

    if (!isExistMusic)
      throw new NotFoundException('Post not found in this community');

    await this.musicRepository.update(
      {
        id: musicId,
      },
      {
        title: dto.title,
        artist: dto.artist,
      },
    );

    const updatedMusic = await this.getOne(musicId);

    return returnMusicForCommunity(updatedMusic);
  }

  async deleteFromCommunity(
    dto: FetchMusicDto,
    musicId: string,
    userId: string,
  ) {
    await this.musicRepository.manager.transaction(async (manager) => {
      const music = await manager.findOne(MusicEntity, {
        where: { id: musicId },
        relations: ['communities'],
      });

      if (!music) throw new NotFoundException('Music not found');

      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
        true,
      );

      const isMusic = community.music.find((music) => music.id === music.id);

      if (!isMusic)
        throw new NotFoundException('Music not found in this community');

      // const isAdmin = community.admins.find((admin) => admin.id === user.id);
      //
      // if (/*music.user.id !== userId ||*/ !isAdmin)
      //   throw new ForbiddenException("You don't have access to this music");

      const communityMusic = community.music;

      await manager.remove(music);
    });
  }

  async addMusicInCommunity(
    dto: FetchMusicDto,
    musicId: string,
    userId: string,
  ) {
    await addAndRemoveMusicInCommunity(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      dto.communityId,
      this.communityRepository,
      this.getOne(musicId),
      'add',
    );

    return this.getOneInCommunity(dto, musicId);
  }

  async removeMusicInCommunity(
    dto: FetchMusicDto,
    musicId: string,
    userId: string,
  ) {
    await addAndRemoveMusicInCommunity(
      musicId,
      this.musicRepository,
      userId,
      this.userRepository,
      dto.communityId,
      this.communityRepository,
      this.getOne(musicId),
      'remove',
    );

    return this.getOne(musicId);
  }
}
