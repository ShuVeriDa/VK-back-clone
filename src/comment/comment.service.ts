import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { UserEntity } from '../user/entity/user.entity';
import { validationUserForComments } from '../components/forServices/validationUserForComments';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { CommunityEntity } from '../community/entity/community.entity';
import { PostEntity } from '../post/entity/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,

    @InjectRepository(CommunityEntity)
    private readonly communityRepository: Repository<CommunityEntity>,
  ) {}

  async findAll(postId: number) {
    const qb = this.commentRepository.createQueryBuilder('c');

    if (postId) {
      qb.where('c.postId = :postId', { postId });
    }

    const arr = await qb
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    return arr.map((obj) => {
      delete obj.user.password;
      return {
        ...obj,
        post: { id: obj.post.id, title: obj.post.text },
      };
    });
  }
  async findByPostId(postId: string) {
    const qb = await this.commentRepository.createQueryBuilder('c');

    const arr = await qb
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    const posts = arr
      .filter((obj) => obj.post.id === postId)
      .map((obj) => {
        delete obj.user.password;
        return {
          ...obj,
          post: { id: obj.post.id, text: obj.post.text },
        };
      });

    return posts;
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
    const post = await this.postRepository.findOne({
      where: { id: dto.postId },
      relations: ['comments'],
    });

    if (post.turnOffComments)
      throw new ForbiddenException('This post has comments turned off');

    const comment = await this.commentRepository.save({
      text: dto.text,
      post: { id: dto.postId },
      user: { id: userId },
    });

    // return await this.commentRepository.findOneBy({ id: comment.id });
    return this.findOneById(comment.id);
  }

  async update(id: string, userId: string, dto: CreateCommentDto) {
    await validationUserForComments(id, userId, this);

    const comment = await this.commentRepository.update(
      {
        id,
      },
      {
        text: dto.text,
        post: { id: dto.postId },
        user: { id: userId },
      },
    );

    return this.findOneById(id);
  }

  async remove(id: string, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    await validationUserForComments(id, userId, this, user.isAdmin);

    return this.commentRepository.delete(id);
  }

  //FOR COMMUNITY
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
    dto: CreateCommentDto,
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
}
