import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
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
  @UseGuards(JwtAuthGuard)
  @Auth()
  create(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.create(dto, userId);
  }
}
