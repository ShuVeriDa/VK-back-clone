import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { UserEntity } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { CommunityEntity } from '../community/entity/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, UserEntity, CommunityEntity]),
    // UserModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
