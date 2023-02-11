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
    });

    return comments.map((comment) => {
      return {
        ...comment,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
          avatar: comment.user.avatar,
        },
        post: comment.post
          ? { id: comment.post.id, text: comment.post.text }
          : null,
        photo: comment.photo
          ? {
              id: comment.photo.id,
              description: comment.photo.description,
              photoUrl: comment.photo.photoUrl,
            }
          : null,
      };
    });

    // const qb = this.commentRepository.createQueryBuilder('c');
    //
    // if (postId) {
    //   qb.where('c.postId = :postId', { postId });
    // }
    //
    // const arr = await qb
    //   .leftJoinAndSelect('c.post', 'post')
    //   .leftJoinAndSelect('c.user', 'user')
    //   .getMany();
    //
    // return arr.map((obj) => {
    //   delete obj.user.password;
    //   return {
    //     ...obj,
    //     post: { id: obj.post.id, title: obj.post.text },
    //   };
    // });
  }
  async findByPostId(postId: string) {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['post', 'user'],
    });

    return comments
      .filter((comment) => comment.post.id === postId)
      .map((comment) => {
        delete comment.user.password;
        return {
          ...comment,
          post: { id: comment.post.id, text: comment.post.text },
          user: {
            id: comment.user.id,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            avatar: comment.user.avatar,
          },
        };
      });

    // const qb = await this.commentRepository.createQueryBuilder('c');
    //
    // const arr = await qb
    //   .leftJoinAndSelect('c.post', 'post')
    //   .leftJoinAndSelect('c.user', 'user')
    //   .getMany();
    //
    // const posts = arr
    //   .filter((obj) => obj.post.id === postId)
    //   .map((obj) => {
    //     delete obj.user.password;
    //     return {
    //       ...obj,
    //       post: { id: obj.post.id, text: obj.post.text },
    //     };
    //   });
    //
    // return posts;
  }

  async findOneById(id: string) {
    const qb = this.commentRepository.createQueryBuilder('c');

    const arr = await qb
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    const comment = arr.find((obj) => obj.id === id);

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    delete comment.user.password;
    return {
      ...comment,
      post: { id: comment.post.id, text: comment.post.text },
    };
  }

  async create(dto: CreateCommentDto, userId: string) {
    if (dto.postId) {
      const post = await this.postRepository.findOne({
        where: { id: dto.postId },
        relations: ['comments'],
      });

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
        where: { id: dto.postId },
        relations: ['comments'],
      });

      if (photo.turnOffComments)
        throw new ForbiddenException('This photo has comments turned off');

      const comment = await this.commentRepository.save({
        text: dto.text,
        photo: { id: photo.id },
        user: { id: userId },
      });

      const newComment = await this.commentRepository.findOne({
        where: { id: comment.id },
        relations: ['user', 'post', 'photo'],
      });

      delete newComment.user.password;
      delete newComment.photo.user.password;
      delete newComment.photo.comments;
      delete newComment.post;

      return newComment;
    }

    // return await this.commentRepository.findOneBy({ id: comment.id });
  }

  async update(dto: UpdateCommentDto, commentId: string, userId: string) {
    await validationUserForComments(commentId, userId, this);

    const comment = await this.commentRepository.update(
      {
        id: commentId,
      },
      {
        text: dto.text,
        post: { id: dto.postId },
        user: { id: userId },
      },
    );

    return this.findOneById(commentId);
  }

  async remove(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    await validationUserForComments(id, userId, this, user.isAdmin);

    return this.commentRepository.delete(id);
  }

  //FOR COMMUNITY

  async getOneCommentInCommunity(dto: FetchCommentDto, commentId: string) {
    const { post } = await getOnePostInCommunity(
      dto.postId,
      this.postRepository,
      dto.communityId,
      this.communityRepository,
    );

    const comment = post.comments.find((comment) => comment.id === commentId);
    return comment;
  }
  async getAllCommentsInCommunity(dto: FetchCommentDto) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['posts', 'posts.comments', 'posts.community'],
    });

    if (!community) throw new NotFoundException('Community not found');

    community.posts.map((p) => {
      delete p.user.password;
      return p;
    });

    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
      relations: ['comments', 'community'],
    });

    if (!post) throw new NotFoundException('Post not found');

    delete post.community.admins;
    delete post.community.members;
    delete post.community.posts;
    delete post.community.music;
    delete post.community.admins;
    delete post.community.author;
    delete post.user.password;

    return post;
  }

  async commentCreateInCommunity(dto: CreateCommentDto, userId: string) {
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
      user: { id: userId },
    });

    return await this.findOneById(comment.id);
  }

  async commentUpdateInCommunity(
    dto: UpdateCommentDto,
    commentId: string,
    userId: string,
  ) {
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

  async commentDeleteFromCommunity(
    dto: FetchCommentDto,
    commentId: string,
    userId: string,
  ) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const comment = await manager.findOne(CommentEntity, {
        where: { id: commentId },
        relations: ['post', 'post.community'],
      });

      if (!comment) throw new NotFoundException('Comment not found');

      const { community, user } = await validationCRUDInCommunity(
        comment.post.community.id,
        this.communityRepository,
        userId,
        this.userRepository,
        true,
      );

      const isAdmin = community.admins.find((admin) => admin.id === user.id);

      if (/*post.user.id !== userId ||*/ !isAdmin)
        throw new ForbiddenException("You don't have access to this comment");

      await manager.remove(comment);
    });
  }
}
