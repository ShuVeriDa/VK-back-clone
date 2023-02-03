import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicEntity } from './entity/music.entity';
import { Repository } from 'typeorm';
import { CreateMusicDto } from './dto/create.dto';
import { UpdateMusicDto } from './dto/update.dto';

@Injectable()
export class MusicService {
  @InjectRepository(MusicEntity)
  private readonly musicRepository: Repository<MusicEntity>;

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

  async getOne(musicId: string) {
    const music = await this.musicRepository.findOne({
      where: { id: musicId },
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

  // async update(dto: UpdateMusicDto, musicId: string, userId: string) {
  //   const newMusic = await this.musicRepository.save({
  //     musicUrl: dto.musicUrl,
  //     user: { id: userId },
  //     musicAdders: [{ id: userId }],
  //   });
  //
  //   const music = await this.musicRepository.findOne({
  //     where: { id: newMusic.id },
  //   });
  //
  //   delete music.user.password;
  //   music.musicAdders.map((m) => {
  //     delete m.password;
  //     return m;
  //   });
  //
  //   return music;
  // }
}
