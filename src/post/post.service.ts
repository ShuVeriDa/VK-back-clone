import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { CreatePostDto } from './entity/dto/create.dto';
import { SearchPostDto } from './entity/dto/search.dto';
import { UpdatePostDto } from './entity/dto/update.dto';

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

  async search(dto: SearchPostDto) {
    const qb = this.postRepository.createQueryBuilder('posts');

    qb.limit(dto.limit || 0);
    qb.take(dto.take || 100);

    if (dto.text) {
      qb.andWhere('posts.text ILIKE :text');
    }

    if (dto.views) {
      qb.orderBy('views', dto.views);
    }

    if (dto.rating) {
      qb.orderBy('rating', dto.rating);
    }

    if (dto.favorites) {
      qb.orderBy('favorites', dto.favorites);
    }

    qb.setParameters({
      text: `%${dto.text}%`,
      views: dto.views || 'DESC',
      rating: dto.rating || 'DESC',
      favorites: dto.favorites || 'DESC',
    });

    const [posts, total] = await qb
      .leftJoinAndSelect('posts.user', 'user')
      .getManyAndCount();

    const arr = posts.map((p) => {
      delete p.user.password;
      delete p.user.createdAt;
      delete p.user.updatedAt;
      return p;
    });

    return { posts: arr, total };
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

  async update(id: string, dto: UpdatePostDto) {
    const food = await this.postRepository.findOneBy({ id });

    if (!food) throw new NotFoundException('Post not found');

    await this.postRepository.update(
      {
        id: id,
      },
      { text: dto.text },
    );

    const fetchPost = await this.postRepository.findOneBy({ id: id });
    const { user } = fetchPost;
    delete user.password;

    return fetchPost;
  }

  async delete(id: string, userId: string) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');

    if (post.user.id !== userId)
      throw new NotFoundException("You don't have not access to this post");

    return this.postRepository.delete(id);
  }

  async addToFavorites(id: string, userId: string) {
    const post = await this.findOne(id);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    // const isNotFavorites =
    //   user.favorites.findIndex((obj) => obj.id === post.id) === -1;

    const isNotFavorites = user.favorites.find((obj) => obj.id === post.id);

    if (!isNotFavorites) {
      user.favorites.push(post);
      post.favorites++;
      await this.userRepository.save(user);
      await this.postRepository.save(post);
    }

    return post;
  }
}
