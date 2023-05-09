import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCommentDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { FetchCommentDto } from './dto/fetch.dto';
import { UpdateCommentDto } from './dto/update.dto';

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

  @Get(':id')
  findOneById(@Param('id') commentId: string) {
    return this.commentService.findOneById(commentId);
  }

  @Get('post/:id')
  findAllByPostId(@Param('id') postId: string) {
    return this.commentService.findAllByPostId(postId);
  }

  @Get('photo/:id')
  findAllByPhotoId(@Param('id') photoId: string) {
    return this.commentService.findAllByPhotoId(photoId);
  }

  @Get('video/:id')
  findAllByVideoId(@Param('id') videoId: string) {
    return this.commentService.findAllByVideoId(videoId);
  }

  @Post()
  @Auth('user')
  createComment(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.createComment(dto, userId);
  }

  @Put(':id')
  @Auth('user')
  updateComment(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.updateComment(dto, commentId, userId);
  }

  @Delete(':id')
  @Auth('user')
  removeComment(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.removeComment(id, userId);
  }

  //............
  //FOR COMMUNITY
  //............

  @Get('/community/all')
  getAllCommentsInCommunity(@Body() dto: FetchCommentDto) {
    return this.commentService.getAllCommentsInCommunity(dto);
  }

  @Get('community/:id')
  getOneCommentInCommunity(
    @Body() dto: FetchCommentDto,
    @Param('id') commentId: string,
  ) {
    return this.commentService.getOneCommentInCommunity(dto, commentId);
  }

  @Post('community')
  @Auth('user')
  commentCreateInCommunity(
    @Body() dto: CreateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.commentCreateInCommunity(dto, userId);
  }

  @Put('community/:id')
  @Auth('user')
  commentUpdateInCommunity(
    @Body() dto: UpdateCommentDto,
    @Param('id') commentId: string,
    @User('id') userId: string,
  ) {
    return this.commentService.commentUpdateInCommunity(dto, commentId, userId);
  }

  @Delete('community/:id')
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
