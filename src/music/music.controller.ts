import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { CreateMusicDto } from './dto/create.dto';
import { UpdateMusicDto } from './dto/update.dto';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  getAll() {
    return this.musicService.getAll();
  }

  @Get('mymusic')
  @Auth('user')
  getMyMusic(@User('id') userId: string) {
    return this.musicService.getMyMusic(userId);
  }

  @Get(':id')
  getOne(@Param('id') musicId: string) {
    return this.musicService.getOne(musicId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreateMusicDto, @User('id') userId: string) {
    return this.musicService.create(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('user')
  update(
    @Body() dto: UpdateMusicDto,
    @Param('id') musicId: string,
    @User('id') userId: string,
  ) {
    return this.musicService.update(dto, musicId, userId);
  }

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') musicId: string, @User('id') userId: string) {
    return this.musicService.delete(musicId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('add/:id')
  @HttpCode(200)
  @Auth('user')
  addMusic(@Param('id') musicId: string, @User('id') userId: string) {
    return this.musicService.addMusic(musicId, userId);
  }
}
