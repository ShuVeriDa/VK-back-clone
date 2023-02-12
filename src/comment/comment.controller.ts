import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCommentDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { FetchCommentDto } from './dto/fetch.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { FetchPhotoDto } from '../photo/dto/fetch.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  findAll() {
    return this.commentService.findAll();
  }
  // findAll(@Query() query: { postId?: string }) {
  //   return this.commentService.findAll(+query.postId);
  // }

  //............
  //FOR POST
  //............

  @Get('post')
  findAllByPostId(@Body() dto: FetchCommentDto) {
    return this.commentService.findAllByPostId(dto);
  }

  @Get('post/:id')
  findOneByPostId(@Param('id') commentId: string) {
    return this.commentService.findOneById(commentId);
  }

  @Post('post')
  @Auth('user')
  createPostComment(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.createPostComment(dto, userId);
  }

  @Put('post/:id')
  @Auth('user')
  updatePostComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.updatePostComment(dto, commentId, userId);
  }

  @Delete('post/:id')
  @Auth('user')
  remove(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.remove(id, userId);
  }

  //............
  //FOR PHOTO
  //............

  @Get('photo')
  findAllByPhotoId(@Body() dto: FetchCommentDto) {
    return this.commentService.findAllByPhotoId(dto);
  }

  @Get('photo/:id')
  findOneByPhotoId(@Param('id') commentId: string) {
    return this.commentService.findOneById(commentId);
  }

  //............
  //FOR COMMUNITY
  //............

  @Get('community/comment')
  getAllCommentsInCommunity(@Body() dto: FetchCommentDto) {
    return this.commentService.getAllCommentsInCommunity(dto);
  }

  @Get('community/comment/:id')
  getOneCommentInCommunity(
    @Body() dto: FetchCommentDto,
    @Param('id') commentId: string,
  ) {
    return this.commentService.getOneCommentInCommunity(dto, commentId);
  }
  @Post('community/comment')
  @Auth('user')
  commentCreateInCommunity(
    @Body() dto: CreateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.commentCreateInCommunity(dto, userId);
  }

  @Put('community/comment/:id')
  @Auth('user')
  commentUpdateInCommunity(
    @Body() dto: UpdateCommentDto,
    @Param('id') commentId: string,
    @User('id') userId: string,
  ) {
    return this.commentService.commentUpdateInCommunity(dto, commentId, userId);
  }

  @Delete('community/comment/:id')
  @Auth('user')
  commentDeleteFromCommunity(
    @Body() dto: FetchCommentDto,
    @Param('id') commentId: string,
    @User('id') userId: string,
  ) {
    return this.commentService.commentDeleteFromCommunity(
      dto,
      commentId,
      userId,
    );
  }
}
