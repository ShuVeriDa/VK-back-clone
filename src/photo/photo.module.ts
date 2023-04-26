import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoEntity } from './entity/photo.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CommunityEntity } from '../community/entity/community.entity';
import { AlbumEntity } from './entity/album.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PhotoEntity,
      UserEntity,
      CommunityEntity,
      AlbumEntity,
    ]),
  ],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
