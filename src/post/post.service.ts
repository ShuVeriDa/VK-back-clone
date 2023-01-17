import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { CreatePostDto } from './entity/dto/create.dto';

@Injectable()
export class PostService {
  @InjectRepository(PostEntity)
  private readonly postRepository: Repository<PostEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async findAll() {
    const posts = await this.postRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return posts.map((obj) => {
      delete obj.user.password;
      delete obj.user.createdAt;
      delete obj.user.updatedAt;
      return obj;
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) throw new NotFoundException('Post not found');

    await this.postRepository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .update()
      .set({ views: () => 'views + 1' })
      .execute();

    delete post.user.password;
    delete post.user.createdAt;
    delete post.user.updatedAt;
    return post;
  }

  async create(dto: CreatePostDto, userId: string) {
    const post = await this.postRepository.save({
      text: dto.text,
      user: { id: userId },
    });

    const fetchPost = await this.postRepository.findOneBy({ id: post.id });
    const { user } = fetchPost;
    delete user.password;

    return fetchPost;
  }
}
