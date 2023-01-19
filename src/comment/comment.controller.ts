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

  @Get(':id')
  findOneById(@Param('id') postId: string) {
    return this.commentService.findOneById(postId);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @Auth()
  create(@Body() dto: CreateCommentDto, @User('id') userId: string) {
    return this.commentService.create(dto, userId);
  }
}
