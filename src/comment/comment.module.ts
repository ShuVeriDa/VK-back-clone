import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CommunityEntity } from '../community/entity/community.entity';
import { PostEntity } from '../post/entity/post.entity';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { VideoEntity } from '../video/entity/video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      UserEntity,
      CommunityEntity,
      PostEntity,
      PhotoEntity,
      VideoEntity,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
