import { Injectable } from '@nestjs/common';
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
