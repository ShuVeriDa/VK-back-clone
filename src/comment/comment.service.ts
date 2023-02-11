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

    return returnCommentsFields(comments);
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

      return this.findOneById(comment.id);
    }
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

  //FOR PHOTO
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
