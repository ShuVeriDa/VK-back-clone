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
import { getOnePostInCommunity } from '../components/forServices/getOnePostInCommunity';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { returnCommentFields } from '../components/forServices/returnCommentFields';
import { returnCommentsFields } from '../components/forServices/returnCommentsFields';
import { getOnePhotoInCommunity } from '../components/forServices/getOnePhotoInCommunity';

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

    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
  ) {}

  async findAll() {
    const comments = await this.commentRepository.find({
      relations: ['user', 'post', 'photo'],
      order: { createdAt: 'DESC' },
    });

    return returnCommentsFields(comments);
  }

  async findOneById(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post', 'user', 'photo'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    return returnCommentFields(comment);
  }

  async findAllByPostId(dto: FetchCommentDto) {
    if (dto.postId) {
      const post = await this.postRepository.findOne({
        where: { id: dto.postId },
      });

      if (!post) throw new NotFoundException('Post not found');

      const comments = await this.commentRepository.find({
        where: { post: { id: post.id } },
        relations: ['post', 'user'],
      });

      return returnCommentsFields(comments);
    }
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

    return returnCommentsFields(comments);
  }

  async createPostComment(dto: CreateCommentDto, userId: string) {
    if (dto.postId && dto.photoId)
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

      return this.findOneById(comment.id);
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

      return this.findOneById(comment.id);
    }
  }

  async updatePostComment(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
    if (dto.postId && dto.photoId)
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
          post: { id: dto.postId },
          user: { id: userId },
        },
      );

      return this.findOneById(commentId);
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
          photo: { id: dto.photoId },
          user: { id: userId },
        },
      );

      return this.findOneById(commentId);
    }
  }

  async remove(id: string, userId: string) {
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
    if (dto.postId && dto.photoId)
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
  }

  async getOneCommentInCommunity(dto: FetchCommentDto, commentId: string) {
    if (dto.postId && dto.photoId)
      throw new ForbiddenException('Enter only one id');

    if (dto.postId) {
      const { post } = await getOnePostInCommunity(
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
  }

  async commentCreateInCommunity(dto: CreateCommentDto, userId: string) {
    if (dto.postId && dto.photoId)
      throw new ForbiddenException('Enter only one id');

    if (dto.postId) {
      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
      );

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
      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
      );

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
  }

  async commentUpdateInCommunity(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
    if (dto.postId && dto.photoId)
      throw new ForbiddenException('Enter only one id');

    if (dto.postId) {
      const { community, user } = await validationCRUDInCommunity(
        dto.communityId,
        this.communityRepository,
        userId,
        this.userRepository,
      );

      const post = community.posts.find((post) => post.id === dto.postId);

      if (!post) throw new NotFoundException('Post not found');

      if (post.turnOffComments)
        throw new ForbiddenException('This post has comments turned off.');

      const comment = await this.findOneById(commentId);

      if (!comment) throw new NotFoundException('Comment not found');

      await this.commentRepository.update(
        { id: commentId },
        {
          text: dto.text,
          post: { id: dto.postId },
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
      );

      const photo = community.photos.find((photo) => photo.id === dto.photoId);

      if (!photo) throw new NotFoundException('Photo not found');

      const comment = await this.findOneById(commentId);

      if (!comment) throw new NotFoundException('Comment not found');

      await this.commentRepository.update(
        { id: comment.id },
        {
          text: dto.text,
          photo: { id: dto.photoId },
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
        relations: ['post', 'post.community', 'photo', 'photo.community'],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      if (dto.postId) {
        const { community, user } = await validationCRUDInCommunity(
          comment.post.community.id,
          this.communityRepository,
          userId,
          this.userRepository,
          true,
        );

        const isAdmin = community.admins.find((admin) => admin.id === user.id);

        const post = await this.postRepository.findOne({
          where: { id: dto.postId },
          relations: ['user'],
        });

        if (post.user.id !== userId || !isAdmin)
          throw new ForbiddenException("You don't have access to this comment");
      }

      if (dto.photoId) {
        const { community, user } = await validationCRUDInCommunity(
          comment.photo.community.id,
          this.communityRepository,
          userId,
          this.userRepository,
          true,
        );

        const isAdmin = community.admins.find((admin) => admin.id === user.id);

        const photo = await this.photoRepository.findOne({
          where: { id: dto.photoId },
          relations: ['user'],
        });

        if (photo.user.id !== userId || !isAdmin)
          throw new ForbiddenException("You don't have access to this comment");
      }

      await manager.remove(comment);
    });
  }
}
