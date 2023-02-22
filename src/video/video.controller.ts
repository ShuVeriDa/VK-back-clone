import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateVideoDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { UpdateVideoDto } from './dto/update.dto';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('all')
  getAll() {
    return this.videoService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') videoId: string) {
    return this.videoService.getOne(videoId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreateVideoDto, @User('id') userId: string) {
    return this.videoService.create(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('user')
  update(
    @Body() dto: UpdateVideoDto,
    @Param('id') videoId: string,
    @User('id') userId: string,
  ) {
    return this.videoService.update(dto, videoId, userId);
  }
}
