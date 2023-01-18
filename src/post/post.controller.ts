import {
  Body,
  Controller,
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
import { CreatePostDto } from './entity/dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { SearchPostDto } from './entity/dto/search.dto';
import { UpdatePostDto } from './entity/dto/update.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
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
}
