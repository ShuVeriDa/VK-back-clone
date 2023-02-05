import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreatePostDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { SearchPostDto } from './dto/search.dto';
import { UpdatePostDto } from './dto/update.dto';
import { FetchPostDto } from './dto/fetch.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get('myposts/:id')
  getMyPosts(@Param('id') userId: string) {
    return this.postService.getMyPosts(userId);
  }

  @Get('/search')
  search(@Query() dto: SearchPostDto) {
    return this.postService.search(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreatePostDto, @User('id') userId: string) {
    return this.postService.create(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('user')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') postId: string, @User('id') userId: string) {
    return this.postService.delete(postId, userId);
  }

  @Post(':id/favorites')
  @Auth('user')
  async addToFavorites(@User('id') userId: string, @Param('id') id: string) {
    return this.postService.addToFavorites(id, userId);
  }

  @Delete(':id/favorites')
  @Auth('user')
  async removeFromFavorites(
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.postService.removeFromFavorites(id, userId);
  }
  @UsePipes(new ValidationPipe())
  @Post(':id/repost')
  @Auth('user')
  async repostPost(@User('id') userId: string, @Param('id') id: string) {
    return this.postService.repostPost(id, userId);
  }

  @UsePipes(new ValidationPipe())
  @Delete(':id/repost')
  @Auth('user')
  async removeFromRepost(@User('id') userId: string, @Param('id') id: string) {
    return this.postService.removeFromRepost(id, userId);
  }

  //for community

  @Get('/community/post/:id')
  getAllPostsInCommunity(@Param('id') communityId: string) {
    return this.postService.getAllPostsInCommunity(communityId);
  }
  @Get('/community/post/:id')
  getOnePostInCommunity(
    @Param('id') postId: string,
    @Body() dto: FetchPostDto,
  ) {
    return this.postService.getOnePostInCommunity(postId, dto);
  }

  @Post('community/post/')
  @Auth('user')
  postCreateInCommunity(
    @Body() dto: CreatePostDto,
    @User('id') userId: string,
  ) {
    return this.postService.postCreateInCommunity(dto, userId);
  }

  @Put('community/post/:id')
  @Auth('user')
  postUpdateInCommunity(
    @Body() dto: UpdatePostDto,
    @Param('id') postId: string,
    @User('id') userId: string,
  ) {
    return this.postService.postUpdateInCommunity(dto, postId, userId);
  }

  @Delete('community/post/:id')
  @Auth('user')
  postDeleteInCommunity(
    @Param('id') postId: string,
    @User('id') userId: string,
  ) {
    return this.postService.postDeleteInCommunity(postId, userId);
  }
}
