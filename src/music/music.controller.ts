import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { CreateMusicDto } from './dto/create.dto';
import { UpdateMusicDto } from './dto/update.dto';
import { SearchMusicDto } from './dto/search.dto';
import { FetchMusicDto } from './dto/fetch.dto';
import { CreatePlaylistDto } from './dto/createPlaylist.dto';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  //           //
  // Playlists //
  //           //

  @Get('playlists')
  @Auth('user')
  getAllPlaylists(@User('id') userId: string) {
    return this.musicService.getAllPlaylist(userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('playlists')
  @HttpCode(200)
  @Auth('user')
  createPlaylist(@Body() dto: CreatePlaylistDto, @User('id') userId: string) {
    return this.musicService.createPlaylist(dto, userId);
  }

  //       //
  // Music //
  //       //

  @Get('all')
  getAll() {
    return this.musicService.getAll();
  }

  @Get()
  @Auth('user')
  getMyMusic(@User('id') userId: string) {
    return this.musicService.getMyMusic(userId);
  }

  @Get('search')
  search(@Query() dto: SearchMusicDto) {
    return this.musicService.search(dto);
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

  @UsePipes(new ValidationPipe())
  @Delete('remove/:id')
  @HttpCode(200)
  @Auth('user')
  removeFromAdders(@Param('id') musicId: string, @User('id') userId: string) {
    return this.musicService.removeFromAdders(musicId, userId);
  }

  ///////////////
  //FOR COMMUNITY
  //////////////

  @Get('community/music')
  getAllInCommunity(@Body() dto: FetchMusicDto) {
    return this.musicService.getAllInCommunity(dto);
  }
  @Get('community/music/:id')
  getOneInCommunity(@Body() dto: FetchMusicDto, @Param('id') musicId: string) {
    return this.musicService.getOneInCommunity(dto, musicId);
  }

  @UsePipes(new ValidationPipe())
  @Post('community/music')
  @HttpCode(200)
  @Auth('user')
  createInCommunity(@Body() dto: CreateMusicDto, @User('id') userId: string) {
    return this.musicService.createInCommunity(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put('community/music/:id')
  @HttpCode(200)
  @Auth('user')
  updateInCommunity(
    @Body() dto: UpdateMusicDto,
    @Param('id') musicId: string,
    @User('id') userId: string,
  ) {
    return this.musicService.updateInCommunity(dto, musicId, userId);
  }

  @Delete('community/music/:id')
  @Auth('user')
  deleteFromCommunity(
    @Body() dto: FetchMusicDto,
    @Param('id') musicId: string,
    @User('id') userId: string,
  ) {
    return this.musicService.deleteFromCommunity(dto, musicId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('community/add/music/:id')
  @HttpCode(200)
  @Auth('user')
  addMusicInCommunity(
    @Body() dto: FetchMusicDto,
    @Param('id') musicId: string,
    @User('id') userId: string,
  ) {
    return this.musicService.addMusicInCommunity(dto, musicId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Delete('community/remove/music/:id')
  @HttpCode(200)
  @Auth('user')
  removeMusicInCommunity(
    @Body() dto: FetchMusicDto,
    @Param('id') musicId: string,
    @User('id') userId: string,
  ) {
    return this.musicService.removeMusicInCommunity(dto, musicId, userId);
  }
}
