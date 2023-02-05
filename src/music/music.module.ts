import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicEntity } from './entity/music.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CommunityEntity } from '../community/entity/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MusicEntity, UserEntity, CommunityEntity]),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
