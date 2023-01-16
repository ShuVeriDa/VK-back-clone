import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreatePostDto } from './entity/dto/create.dto';
import { User } from '../user/decorators/user.decorator';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreatePostDto, @User('id') userId: string) {
    return this.postService.create(dto, userId);
  }
}
