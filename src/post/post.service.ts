import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { CreatePostDto } from './dto/create.dto';
import { SearchPostDto } from './dto/search.dto';
import { UpdatePostDto } from './dto/update.dto';
import { getOnePost } from '../components/forServices/getOnePost';
import { favoritesAndReposts } from '../components/forServices/favoritesAndReposts';
import { removeFromFavoritesAndReposts } from '../components/forServices/removeFromFavoritesAndReposts';
import { CommunityEntity } from '../community/entity/community.entity';

@Injectable()
export class PostService {
  @InjectRepository(PostEntity)
  private readonly postRepository: Repository<PostEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CommunityEntity)
  private readonly communityRepository: Repository<CommunityEntity>;

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
    return getOnePost(id, this.postRepository);
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
    return favoritesAndReposts(
      id,
      userId,
      'favorites',
      this.postRepository,
      this.userRepository,
    );
  }

  async removeFromFavorites(id: string, userId: string) {
    // const post = await getOnePost(id, this.postRepository);
    //
    // const user = await this.userRepository.findOne({
    //   where: { id: userId },
    //   relations: ['favorites'],
    // });
    //
    // const postIndex = user.favorites.findIndex((obj) => obj.id === post.id);
    //
    // if (postIndex >= 0) {
    //   user.favorites.splice(postIndex, 1);
    //   post.favorites--;
    //   await this.userRepository.save(user);
    //   await this.postRepository.save(post);
    // }
    //
    // return post;

    return removeFromFavoritesAndReposts(
      id,
      userId,
      'favorites',
      this.postRepository,
      this.userRepository,
    );
  }

  async repostPost(id: string, userId: string) {
    return favoritesAndReposts(
      id,
      userId,
      'reposts',
      this.postRepository,
      this.userRepository,
    );
  }

  async removeFromRepost(id: string, userId: string) {
    //   const post = await getOnePost(id, this.postRepository);
    //
    //   const user = await this.userRepository.findOne({
    //     where: { id: userId },
    //     relations: ['reposts'],
    //   });
    //
    //   const postIndex = user.reposts.findIndex((obj) => obj.id === post.id);
    //
    //   if (postIndex >= 0) {
    //     user.reposts.splice(postIndex, 1);
    //     post.reposts--;
    //     await this.userRepository.save(user);
    //     await this.postRepository.save(post);
    //   }
    //
    //   return post;
    // }

    return removeFromFavoritesAndReposts(
      id,
      userId,
      'reposts',
      this.postRepository,
      this.userRepository,
    );
  }

  //for community
  async writePost(dto: CreatePostDto, communityId: string, userId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['members'],
    });

    if (!community)
      throw new NotFoundException(`Community with id ${communityId} not found`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const post = await this.postRepository.save({
      text: dto.text,
      user: { id: user.id },
      community: { id: community.id },
    });

    const fetchPost = await this.postRepository.findOne({
      where: { id: post.id },
      relations: ['community'],
    });

    delete fetchPost.user.password;

    return fetchPost;
  }
}
