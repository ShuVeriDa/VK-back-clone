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

  async delete(postId: string, userId: string) {
    await this.communityRepository.manager.transaction(async (manager) => {
      const post = await manager.findOne(PostEntity, {
        where: { id: postId },
        relations: ['comments'],
      });

      if (!post) throw new NotFoundException('Post not found');

      if (String(post.user.id) !== String(userId))
        throw new ForbiddenException("You don't have not access to this post");

      const comments = post.comments;
      for (const comment of comments) {
        await manager.remove(comment);
      }

      await manager.remove(post);
    });

    // const post = await this.postRepository.findOneBy({ id: postId });
    // if (!post) throw new NotFoundException('Post not found');
    //
    // if (String(post.user.id) !== String(userId))
    //   throw new ForbiddenException("You don't have not access to this post");
    //
    // return this.postRepository.delete(postId);
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
    return removeFromFavoritesAndReposts(
      id,
      userId,
      'reposts',
      this.postRepository,
      this.userRepository,
    );
  }

  //for community

  async getAllPostsInCommunity(communityId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
      relations: ['posts', 'posts.comments'],
    });

    if (!community) throw new NotFoundException('Community not found');

    return community.posts.map((p) => {
      delete p.user.password;
      return p;
    });
  }

  async getOnePostInCommunity(postId: string, dto: FetchPostDto) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post) throw new NotFoundException('Post not found');

    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['members', 'posts'],
    });

    if (!community)
      throw new NotFoundException(
        `Community with id ${dto.communityId} not found`,
      );

    const isExistPost = community.posts.find((post) => post.id === postId);

    if (!isExistPost)
      throw new NotFoundException('Post not found in this community');

    delete post.user.password;
    delete post.community.author.password;
    post.community.members.map((m) => {
      delete m.password;
      return m;
    });
    return post;
  }
  async postCreateInCommunity(dto: CreatePostDto, userId: string) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['members'],
    });

    if (!community)
      throw new NotFoundException(
        `Community with id ${dto.communityId} not found`,
      );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const isAdmin = community.admins.find((admin) => admin.id === user.id);

    if (!isAdmin) throw new ForbiddenException('You have no rights!');

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
    delete fetchPost.community.author.password;

    fetchPost.community.members.map((m) => {
      delete m.password;
      return m;
    });

    fetchPost.community.admins.map((a) => {
      delete a.password;
      return a;
    });

    return fetchPost;
  }

  async postUpdateInCommunity(
    dto: UpdatePostDto,
    postId: string,
    userId: string,
  ) {
    const community = await this.communityRepository.findOne({
      where: { id: dto.communityId },
      relations: ['members'],
    });

    if (!community)
      throw new NotFoundException(
        `Community with id ${dto.communityId} not found`,
      );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    await this.postRepository.update(
      { id: postId },
      {
        text: dto.text,
      },
    );

    const fetchPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    delete fetchPost.user.password;

    return fetchPost;
  }

  async postDeleteInCommunity(postId: string, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post) throw new NotFoundException(`Post not found`);

    const community = await this.communityRepository.findOne({
      where: { id: post.community.id },
      relations: ['members'],
    });

    if (!community) throw new NotFoundException(`Community not found`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    if (post.user.id !== userId)
      throw new NotFoundException("You don't have not access to this post");

    return await this.postRepository.delete(postId);
  }
}
