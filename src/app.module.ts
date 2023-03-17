import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserEntity } from './user/entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { PostEntity } from './post/entity/post.entity';
import { FileModule } from './file/file.module';
import { CommentModule } from './comment/comment.module';
import { CommentEntity } from './comment/entity/comment.entity';
import { CommunityModule } from './community/community.module';
import { CommunityEntity } from './community/entity/community.entity';
import { MessageModule } from './message/message.module';
import { MessageEntity } from './message/entity/message.entity';
import { MusicModule } from './music/music.module';
import { MusicEntity } from './music/entity/music.entity';
import { PhotoModule } from './photo/photo.module';
import { PhotoEntity } from './photo/entity/photo.entity';
import { VideoModule } from './video/video.module';
import { VideoEntity } from './video/entity/video.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '5940530bbbb',
      database: 'vk',
      entities: [
        UserEntity,
        PostEntity,
        CommentEntity,
        // FriendEntity,
        CommunityEntity,
        MessageEntity,
        MusicEntity,
        PhotoEntity,
        VideoEntity,
      ],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    PostModule,
    FileModule,
    CommentModule,
    // FriendModule,
    CommunityModule,
    MessageModule,
    MusicModule,
    PhotoModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
