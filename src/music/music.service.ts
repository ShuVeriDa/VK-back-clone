import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MusicEntity } from './entity/music.entity';
import { Repository } from 'typeorm';
import { CreateMusicDto } from './dto/create.dto';

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
}
