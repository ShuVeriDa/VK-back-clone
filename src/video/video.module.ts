import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from './entity/video.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CommunityEntity } from '../community/entity/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity, UserEntity, CommunityEntity]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
