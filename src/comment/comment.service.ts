import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CreateCommentDto } from './dto/comment.dto';
import { UserEntity } from '../user/entity/user.entity';
import { map } from 'rxjs';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

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
    const comment = await this.commentRepository.save({
      text: dto.text,
      post: { id: dto.postId },
      user: { id: userId },
    });

    // return await this.commentRepository.findOneBy({ id: comment.id });
    return this.findOneById(comment.id);
  }
}
