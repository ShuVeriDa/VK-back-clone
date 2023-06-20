import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicEntity } from './entity/music.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CommunityEntity } from '../community/entity/community.entity';
import { PlaylistEntity } from './entity/playlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MusicEntity,
      UserEntity,
      CommunityEntity,
      PlaylistEntity,
    ]),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
