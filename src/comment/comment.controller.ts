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

  @Get('/post')
  findAllByPostId(@Body('postId') postId: string) {
    return this.commentService.findByPostId(postId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.commentService.findOneById(id);
  }

  // @Get('photo')
  // findAllByPhotoId(@Param('id') postId: string) {
  //   return this.commentService.findByPostId(postId);
  // }

  @Post()
  @Auth('user')
  create(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.create(dto, userId);
  }

  @Put(':id')
  @Auth('user')
  update(
    @Param('id') commentId: string,
    @Body() dto: UpdateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.update(dto, commentId, userId);
  }

  @Delete(':id')
  @Auth('user')
  remove(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.remove(id, userId);
  }

  //FOR COMMUNITY

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
