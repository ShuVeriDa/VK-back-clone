import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/create.dto';
import { UserEntity } from '../user/entity/user.entity';
import { validationUserForComments } from '../components/forServices/validationUserForComments';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { CommunityEntity } from '../community/entity/community.entity';
import { PostEntity } from '../post/entity/post.entity';
import { FetchCommentDto } from './dto/fetch.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { getOnePostInCommunityComponent } from '../components/forServices/getOnePostInCommunityComponent';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { returnCommentFields } from '../components/forServices/returnCommentFields';
import { returnCommentsFields } from '../components/forServices/returnCommentsFields';
import { getOnePhotoInCommunity } from '../components/forServices/getOnePhotoInCommunity';
import { VideoEntity } from '../video/entity/video.entity';
import { getOneVideoInCommunity } from '../components/forServices/getOneVideoInCommunity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(PhotoEntity)
    private readonly photoRepository: Repository<PhotoEntity>,
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
  ) {}

  async findAll() {
    const comments = await this.commentRepository.find({
      relations: ['user', 'post', 'photo', 'video'],
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => {
      return returnCommentFields(comment);
    });
  }

  async findOneById(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post', 'user', 'photo', 'video'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return returnCommentFields(comment);
  }

  async findAllByPostId(dto: FetchCommentDto) {
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const comments = await this.commentRepository.find({
      where: { post: { id: post.id } },
      relations: ['post', 'user'],
    });

    return comments.map((comment) => {
      return returnCommentFields(comment);
    });
  }

  async findAllByPhotoId(dto: FetchCommentDto) {
    const photo = await this.photoRepository.findOne({
      where: { id: dto.photoId },
    });

    if (!photo) throw new NotFoundException('Photo not found');

    const comments = await this.commentRepository.find({
      where: { photo: { id: photo.id } },
      relations: ['photo', 'user'],
    });

    return comments.map((comment) => {
      return returnCommentFields(comment);
    });
  }

  async findAllByVideoId(dto: FetchCommentDto) {
    const video = await this.videoRepository.findOne({
      where: { id: dto.videoId },
    });

    if (!video) throw new NotFoundException('Video not found');

    const comments = await this.commentRepository.find({
      where: { video: { id: video.id } },
      relations: ['user', 'video'],
    });

    return comments.map((comment) => {
      return returnCommentFields(comment);
    });
  }

  async createComment(dto: CreateCommentDto, userId: string) {
    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    if (dto.postId) {
      const post = await this.postRepository.findOne({
        where: { id: dto.postId },
        relations: ['comments'],
      });

      if (!post) throw new NotFoundException('Post not found');

      if (post.turnOffComments)
        throw new ForbiddenException('This post has comments turned off');

      const comment = await this.commentRepository.save({
        text: dto.text,
        post: { id: post.id },
        user: { id: userId },
      });

      return await this.findOneById(comment.id);
    }

    if (dto.photoId) {
      const photo = await this.photoRepository.findOne({
        where: { id: dto.photoId },
        relations: ['comments'],
      });

      if (!photo) throw new NotFoundException('Photo not found');

      if (photo.turnOffComments)
        throw new ForbiddenException('This photo has comments turned off');

      const comment = await this.commentRepository.save({
        text: dto.text,
        photo: { id: photo.id },
        user: { id: userId },
      });

      return await this.findOneById(comment.id);
    }

    if (dto.videoId) {
      const video = await this.videoRepository.findOne({
        where: { id: dto.videoId },
        relations: ['comments'],
      });

      if (!video) throw new NotFoundException('Video not found');

      if (video.turnOffComments)
        throw new ForbiddenException('This video has comments turned off');

      const comment = await this.commentRepository.save({
        text: dto.text,
        video: { id: video.id },
        user: { id: userId },
      });

      return await this.findOneById(comment.id);
    }
  }

  async updateComment(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new NotFoundException('User not found');

    await validationUserForComments(commentId, user.id, this, 'PUT');

    if (dto.postId) {
      const post = await this.postRepository.findOne({
        where: { id: dto.postId },
        relations: ['comments'],
      });

      if (!post) throw new NotFoundException('Post not found');

      const comment = post.comments.find((comment) => comment.id === commentId);

      if (!comment)
        throw new NotFoundException('Comment not found on this post');

      await this.commentRepository.update(
        {
          id: comment.id,
        },
        {
          text: dto.text,
          post: { id: post.id },
          user: { id: userId },
        },
      );

      return await this.findOneById(commentId);
    }

    if (dto.photoId) {
      const photo = await this.photoRepository.findOne({
        where: { id: dto.photoId },
        relations: ['comments'],
      });

      if (!photo) throw new NotFoundException('Photo not found');

      const comment = photo.comments.find(
        (comment) => comment.id === commentId,
      );

      if (!comment)
        throw new NotFoundException('Comment not found on this photo');

      await this.commentRepository.update(
        {
          id: comment.id,
        },
        {
          text: dto.text,
          photo: { id: photo.id },
          user: { id: userId },
        },
      );

      return await this.findOneById(commentId);
    }

    if (dto.videoId) {
      const video = await this.videoRepository.findOne({
        where: { id: dto.videoId },
        relations: ['comments'],
      });

      if (!video) throw new NotFoundException('Video not found');

      const comment = video.comments.find(
        (comment) => comment.id === commentId,
      );

      if (!comment)
        throw new NotFoundException('Comment not found on this video');

      await this.commentRepository.update(
        {
          id: comment.id,
        },
        {
          text: dto.text,
          video: { id: video.id },
          user: { id: userId },
        },
      );

      return await this.findOneById(commentId);
    }
  }

  async removeComment(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const comment = await this.findOneById(id);

    await validationUserForComments(
      comment.id,
      user.id,
      this,
      'DELETE',
      user.isAdmin,
    );

    return this.commentRepository.delete(comment.id);
  }

  //.............//
  //FOR COMMUNITY//
  //.............//

  async getAllCommentsInCommunity(dto: FetchCommentDto) {
    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: [
        'posts',
        'posts.comments',
        'posts.community',
        'photos',
        'photos.comments',
        'photos.community',
        'video',
        'video.comments',
        'video.communities',
      ],
    });

    if (!community) throw new NotFoundException('Community not found');

    if (dto.postId) {
      community.posts.map((p) => {
        delete p.user.password;
        return p;
      });

      const post = await this.postRepository.findOne({
        where: { id: dto.postId },
        relations: ['comments', 'comments.user', 'community'],
      });

      if (!post) throw new NotFoundException('Post not found');

      delete post.community.admins;
      delete post.community.members;
      delete post.community.posts;
      delete post.community.music;
      delete post.community.admins;
      delete post.community.author;
      delete post.user.password;

      post.comments.map((comment) => {
        delete comment.user.password;
        return comment;
      });

      return post;
    }

    if (dto.photoId) {
      community.photos.map((p) => {
        delete p.user.password;
        return p;
      });

      const photo = await this.photoRepository.findOne({
        where: { id: dto.photoId },
        relations: ['comments', 'comments.user', 'community'],
      });

      if (!photo) throw new NotFoundException('Photo not found');

      delete photo.community.admins;
      delete photo.community.members;
      delete photo.community.posts;
      delete photo.community.music;
      delete photo.community.admins;
      delete photo.community.author;
      delete photo.user.password;

      photo.comments.map((comment) => {
        delete comment.user.password;
        return comment;
      });

      return photo;
    }

    if (dto.videoId) {
      community.video.map((p) => {
        delete p.user.password;
        return p;
      });

      const video = await this.videoRepository.findOne({
        where: { id: dto.videoId },
        relations: ['comments', 'comments.user', 'communities'],
      });

      if (!video) throw new NotFoundException('Video not found');

      video.communities.map((community) => {
        delete community.admins;
        delete community.members;
        delete community.posts;
        delete community.music;
        delete community.admins;
        delete community.author;

        return community;
      });

      delete video.user.password;

      video.comments.map((comment) => {
        delete comment.user.password;
        return comment;
      });

      return video;
    }
  }

  async getOneCommentInCommunity(dto: FetchCommentDto, commentId: string) {
    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    if (dto.postId) {
      const { post } = await getOnePostInCommunityComponent(
        dto.postId,
        this.postRepository,
        dto.communityId,
        this.communityRepository,
      );

      // const comment = post.comments.find((comment) => comment.id === commentId);

      const comment = await this.commentRepository.findOne({
        where: { post: { comments: { id: commentId } } },
        relations: ['user'],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      delete comment.user.password;
      return comment;
    }

    if (dto.photoId) {
      const { photo } = await getOnePhotoInCommunity(
        dto.photoId,
        this.photoRepository,
        dto.communityId,
        this.communityRepository,
      );

      const comment = await this.commentRepository.findOne({
        where: { photo: { comments: { id: commentId } } },
        relations: ['user'],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      // const comment = photo.comments.find(
      //   (comment) => comment.id === commentId,
      // );

      delete comment.user.password;
      return comment;
    }

    if (dto.videoId) {
      const { video } = await getOneVideoInCommunity(
        dto.videoId,
        this.videoRepository,
        dto.communityId,
        this.communityRepository,
      );

      const comment = await this.commentRepository.findOne({
        where: { video: { comments: { id: commentId } } },
        relations: ['user'],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      // const comment = photo.comments.find(
      //   (comment) => comment.id === commentId,
      // );

      delete comment.user.password;
      return comment;
    }
  }

  async commentCreateInCommunity(dto: CreateCommentDto, userId: string) {
    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
      false,
    );

    if (dto.postId) {
      const post = community.posts.find((post) => post.id === dto.postId);

      if (!post) throw new NotFoundException('Post not found');

      if (post.turnOffComments)
        throw new ForbiddenException('This post has comments turned off.');

      const comment = await this.commentRepository.save({
        text: dto.text,
        post: { id: post.id },
        user: { id: user.id },
      });

      return await this.findOneById(comment.id);
    }

    if (dto.photoId) {
      const photo = community.photos.find((photo) => photo.id === dto.photoId);

      if (!photo) throw new NotFoundException('Photo not found');

      if (photo.turnOffComments)
        throw new ForbiddenException('This photo has comments turned off.');

      const comment = await this.commentRepository.save({
        text: dto.text,
        photo: { id: photo.id },
        user: { id: user.id },
      });

      return await this.findOneById(comment.id);
    }

    if (dto.videoId) {
      const video = community.video.find((v) => v.id === dto.videoId);

      if (!video) throw new NotFoundException('Video not found');

      if (video.turnOffComments)
        throw new ForbiddenException('This video has comments turned off.');

      const comment = await this.commentRepository.save({
        text: dto.text,
        video: { id: video.id },
        user: { id: user.id },
      });

      return await this.findOneById(comment.id);
    }
  }

  async commentUpdateInCommunity(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
    const comment = await this.findOneById(commentId);

    if (
      (dto.postId && dto.photoId) ||
      (dto.postId && dto.photoId && dto.videoId)
    )
      throw new ForbiddenException('Enter only one id');

    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
      false,
      true,
      comment.user.id,
    );

    if (dto.postId) {
      const post = community.posts.find((post) => post.id === dto.postId);

      if (!post) throw new NotFoundException('Post not found');

      if (post.turnOffComments)
        throw new ForbiddenException('This post has comments turned off.');

      if (!comment) throw new NotFoundException('Comment not found');

      await this.commentRepository.update(
        { id: commentId },
        {
          text: dto.text,
          post: { id: post.id },
          user: { id: user.id },
        },
      );

      return await this.findOneById(comment.id);
    }

    if (dto.photoId) {
      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
        false,
        true,
        comment.user.id,
      );

      const photo = community.photos.find((photo) => photo.id === dto.photoId);

      if (!photo) throw new NotFoundException('Photo not found');

      if (!comment) throw new NotFoundException('Comment not found');

      await this.commentRepository.update(
        { id: comment.id },
        {
          text: dto.text,
          photo: { id: photo.id },
          user: { id: user.id },
        },
      );

      return await this.findOneById(comment.id);
    }

    if (dto.videoId) {
      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
        false,
        true,
        comment.user.id,
      );

      const video = community.video.find((v) => v.id === dto.videoId);

      if (!video) throw new NotFoundException('Video not found');

      if (!comment) throw new NotFoundException('Comment not found');

      await this.commentRepository.update(
        { id: comment.id },
        {
          text: dto.text,
          video: { id: video.id },
          user: { id: user.id },
        },
      );

      return await this.findOneById(comment.id);
    }
  }

  async commentDeleteFromCommunity(
    dto: FetchCommentDto,
    commentId: string,
    userId: string,
  ) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const comment = await manager.findOne(CommentEntity, {
        where: { id: commentId },
        relations: [
          'post',
          'post.community',
          'photo',
          'photo.community',
          'user',
          'video',
          'video.communities',
        ],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      if (!dto.postId && dto.photoId && !dto.videoId)
        throw new ForbiddenException(
          'Enter the ID of the post or photo or video',
        );

      if (dto.postId) {
        const { community, user } = await validationCRUDInCommunity(
          // comment.post.community.id,
          dto.communityId,
          this.communityRepository,
          userId,
          this.userRepository,
          true,
          false,
          comment.user.id,
        );

        const isComment = comment.post.comments.find(
          (c) => c.id === comment.id,
        );

        if (!isComment)
          throw new NotFoundException('Comment not found in this post');

        return await manager.remove(comment);
      }

      if (dto.photoId) {
        const { community, user } = await validationCRUDInCommunity(
          // comment.photo.community.id,
          dto.communityId,
          this.communityRepository,
          userId,
          this.userRepository,
          true,
          false,
          comment.user.id,
        );

        const isComment = comment.photo.comments.find(
          (c) => c.id === comment.id,
        );

        if (!isComment)
          throw new NotFoundException('Comment not found in this photo');

        return await manager.remove(comment);
      }

      if (dto.videoId) {
        const { community, user } = await validationCRUDInCommunity(
          dto.communityId,
          this.communityRepository,
          userId,
          this.userRepository,
          true,
          false,
          comment.user.id,
        );

        console.log(comment.video);

        const isComment = comment.video.comments.find(
          (c) => c.id === comment.id,
        );

        if (!isComment)
          throw new NotFoundException('Comment not found in this video');

        return await manager.remove(comment);
      }
    });
  }
}
