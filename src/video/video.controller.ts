import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateVideoDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('all')
  getAll() {
    return this.videoService.getAll();
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreateVideoDto, @User('id') userId: string) {
    return this.videoService.create(dto, userId);
  }
}
