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
import { VideoService } from './video.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateVideoDto } from './dto/create.dto';
import { User } from '../user/decorators/user.decorator';
import { UpdateVideoDto } from './dto/update.dto';
import { SearchVideoDto } from '../photo/dto/search.dto';
import { FetchVideoDto } from './dto/fetch.dto';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('all')
  getAll() {
    return this.videoService.getAll();
  }

  @Get()
  @Auth('user')
  getMyVideo(@User('id') userId: string) {
    return this.videoService.getMyVideo(userId);
  }

  @Get('search')
  search(@Query() dto: SearchVideoDto) {
    return this.videoService.search(dto);
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

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') videoId: string, @User('id') userId: string) {
    return this.videoService.delete(videoId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('add/:id')
  @HttpCode(200)
  @Auth('user')
  addVideo(@Param('id') videoId: string, @User('id') userId: string) {
    return this.videoService.addVideo(videoId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Delete('remove/:id')
  @HttpCode(200)
  @Auth('user')
  removeFromAdders(@Param('id') videoId: string, @User('id') userId: string) {
    return this.videoService.removeFromAdders(videoId, userId);
  }

  ///////////////
  //FOR COMMUNITY
  //////////////

  @Get('community/video')
  getAllInCommunity(@Body() dto: FetchVideoDto) {
    return this.videoService.getAllInCommunity(dto);
  }

  @Get('community/video/:id')
  getOneInCommunity(@Body() dto: FetchVideoDto, @Param('id') videoId: string) {
    return this.videoService.getOneInCommunity(dto, videoId);
  }

  @UsePipes(new ValidationPipe())
  @Post('community/video')
  @HttpCode(200)
  @Auth('user')
  createInCommunity(@Body() dto: CreateVideoDto, @User('id') userId: string) {
    return this.videoService.createInCommunity(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put('community/video/:id')
  @HttpCode(200)
  @Auth('user')
  updateInCommunity(
    @Body() dto: UpdateVideoDto,
    @Param('id') videoId: string,
    @User('id') userId: string,
  ) {
    return this.videoService.updateInCommunity(dto, videoId, userId);
  }

  @Delete('community/video/:id')
  @Auth('user')
  deleteFromCommunity(
    @Body() dto: FetchVideoDto,
    @Param('id') videoId: string,
    @User('id') userId: string,
  ) {
    return this.videoService.deleteFromCommunity(dto, videoId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post('community/add/video/:id')
  @HttpCode(200)
  @Auth('user')
  addVideoInCommunity(
    @Body() dto: FetchVideoDto,
    @Param('id') videoId: string,
    @User('id') userId: string,
  ) {
    return this.videoService.addVideoInCommunity(dto, videoId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Delete('community/remove/video/:id')
  @HttpCode(200)
  @Auth('user')
  removeVideoInCommunity(
    @Body() dto: FetchVideoDto,
    @Param('id') videoId: string,
    @User('id') userId: string,
  ) {
    return this.videoService.removeVideoInCommunity(dto, videoId, userId);
  }
}
