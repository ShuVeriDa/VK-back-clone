import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { FetchPostDto } from './dto/fetch.dto';
import { validationCRUDInCommunity } from '../components/forServices/validationCRUDInCommunity';
import { getOnePostInCommunityComponent } from '../components/forServices/getOnePostInCommunityComponent';
import { returnPostPhotoForCommunity } from '../components/forServices/returnPostPhotoForCommunity';
import { createPost } from '../components/forServices/createPost';

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
      relations: ['community'],
    });

    return posts.map((post) => {
      return returnPostPhotoForCommunity(post);
    });
  }

  async getMyPosts(userId: string) {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['community'],
    });

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['reposts'],
    });

    if (!user) throw new NotFoundException('User not found');

    const filteredPosts = posts
      .filter((post) => post.community === null)
      .sort((a, b) => {
        if (a.updatedAt > b.updatedAt) return -1;
        if (a.updatedAt < b.updatedAt) return 1;
        return 0;
      });

    return filteredPosts.map((post) => {
      return returnPostPhotoForCommunity(post);
    });

    // const filteredPosts = posts.filter((post) => post.community === null);
    // const combinedPosts = filteredPosts.concat(user.reposts).sort((a, b) => {
    //   if (a.updatedAt > b.updatedAt) return -1;
    //   if (a.updatedAt < b.updatedAt) return 1;
    //   return 0;
    // });
    //
    // return combinedPosts.map((post) => {
    //   return returnPostPhotoForCommunity(post);
    // });
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
      .leftJoinAndSelect('posts.community', 'community')
      .getManyAndCount();

    const arr = posts.map((post) => {
      return returnPostPhotoForCommunity(post);
    });

    return { posts: arr, total };
  }

  async findOne(id: string) {
    const post = await getOnePost(id, this.postRepository);

    return returnPostPhotoForCommunity(post);
  }

  async create(dto: CreatePostDto, userId: string) {
    return createPost(this.postRepository, dto, userId);
  }

  async update(id: string, dto: UpdatePostDto) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) throw new NotFoundException('Post not found');

    await this.postRepository.update(
      {
        id: post.id,
      },
      {
        text: dto.text,
        imageUrl: dto.imageUrl,
        musicUrl: dto.musicUrl,
        videoUrl: dto.videoUrl,
        turnOffComments: dto.turnOffComments,
      },
    );

    const fetchPost = await this.postRepository.findOneBy({ id: id });

    return returnPostPhotoForCommunity(fetchPost);
  }

  async delete(postId: string, userId: string) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const post = await manager.findOne(PostEntity, {
        where: { id: postId },
        relations: ['comments', 'community'],
      });

      if (!post) throw new NotFoundException('Post not found');

      const isCommunity = post.community;

      if (String(post.user.id) !== String(userId) || isCommunity)
        throw new ForbiddenException("You don't have access to this post");

      const comments = post.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(post);
    });
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
    return removeFromFavoritesAndReposts(
      id,
      userId,
      'favorites',
      this.postRepository,
      this.userRepository,
    );
  }

  async repostPost(id: string, userId: string, dto: CreatePostDto) {
    await favoritesAndReposts(
      id,
      userId,
      'reposts',
      this.postRepository,
      this.userRepository,
    );

    const createPost = await this.create(dto, userId);
    const repost = await this.findOne(id);

    return {
      ...createPost,
      repost: repost,
    };
  }

  async removeFromRepost(id: string, userId: string) {
    return removeFromFavoritesAndReposts(
      id,
      userId,
      'reposts',
      this.postRepository,
      this.userRepository,
    );
  }

  //for community

  async getAllPostsInCommunity(dto: FetchPostDto) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['posts', 'posts.comments', 'posts.community'],
    });

    if (!community) throw new NotFoundException('Community not found');

    return community.posts.map((post) => {
      return returnPostPhotoForCommunity(post);
    });
  }

  async getOnePostInCommunity(dto: FetchPostDto, postId: string) {
    const { post } = await getOnePostInCommunityComponent(
      postId,
      this.postRepository,
      dto.communityId,
      this.communityRepository,
    );

    return post;
  }

  async postCreateInCommunity(dto: CreatePostDto, userId: string) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    return createPost(this.postRepository, dto, userId, community.id);
  }

  async postUpdateInCommunity(
    dto: UpdatePostDto,
    postId: string,
    userId: string,
  ) {
    const { community, user } = await validationCRUDInCommunity(
      dto.communityId,
      this.communityRepository,
      userId,
      this.userRepository,
    );

    const post = community.posts.find((post) => post.id === postId);

    if (!post) throw new NotFoundException('Post not found in this community');

    await this.postRepository.update(
      { id: post.id },
      {
        text: dto.text,
        imageUrl: dto.imageUrl,
        musicUrl: dto.musicUrl,
        videoUrl: dto.videoUrl,
        turnOffComments: dto.turnOffComments,
      },
    );

    return await getOnePostInCommunityComponent(
      post.id,
      this.postRepository,
      dto.communityId,
      this.communityRepository,
    );
  }

  async postDeleteInCommunity(postId: string, userId: string) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const post = await manager.findOne(PostEntity, {
        where: { id: postId },
        relations: ['community'],
      });

      if (!post) throw new NotFoundException(`Post not found`);

      const { community, user } = await validationCRUDInCommunity(
        post.community.id,
        this.communityRepository,
        userId,
        this.userRepository,
        true,
        true,
        post.user.id,
      );

      const isExistPost = community.posts.some((p) => p.id === post.id);

      if (!isExistPost)
        throw new NotFoundException('Post not found in this community');

      // const isAdmin = community.admins.find((admin) => admin.id === user.id);
      //
      // if (/*post.user.id !== userId ||*/ !isAdmin)
      //   throw new ForbiddenException("You don't have access to this post");

      const comments = post.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(post);
    });
  }
}
