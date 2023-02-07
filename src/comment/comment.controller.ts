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
import { CreateCommentDto } from './dto/comment.dto';
import { User } from '../user/decorators/user.decorator';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  findAll(@Query() query: { postId?: string }) {
    return this.commentService.findAll(+query.postId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.commentService.findOneById(id);
  }

  @Get('post/:id')
  findByPostId(@Param('id') postId: string) {
    return this.commentService.findByPostId(postId);
  }

  @Post()
  @Auth('user')
  create(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.create(dto, userId);
  }

  @Put(':id')
  @Auth('user')
  update(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.update(id, userId, dto);
  }

  @Delete(':id')
  @Auth('user')
  remove(@Param('id') id: string, @User('id') userId: string) {
    return this.commentService.remove(id, userId);
  }

  //FOR COMMUNITY

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
    @Body() dto: CreateCommentDto,
    @Param('id') commentId: string,
    @User('id') userId: string,
  ) {
    return this.commentService.commentUpdateInCommunity(dto, commentId, userId);
  }
}
