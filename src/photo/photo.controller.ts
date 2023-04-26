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
import { PhotoService } from './photo.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { CreatePhotoDto } from './photoDto/create.dto';
import { UpdatePhotoDto } from './photoDto/update.dto';
import { FetchPhotoDto } from './photoDto/fetch.dto';
import { CreateAlbumDto } from './albumDto/create.dto';
import { UpdateAlbumDto } from './albumDto/update.dto';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  //album
  @Get('albums')
  @Auth('user')
  getAllAlbum(@User('id') userId: string) {
    return this.photoService.getAllAlbum(userId);
  }

  @Get('albums/:id')
  getOneAlbum(@Param('id') photoId: string) {
    return this.photoService.getOneAlbum(photoId);
  }

  @UsePipes(new ValidationPipe())
  @Post('albums')
  @HttpCode(200)
  @Auth('user')
  createAlbum(@Body() dto: CreateAlbumDto, @User('id') userId: string) {
    return this.photoService.createAlbum(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put('albums/:id')
  @HttpCode(200)
  @Auth('user')
  updateAlbum(
    @Body() dto: UpdateAlbumDto,
    @Param('id') albumId: string,
    @User('id') userId: string,
  ) {
    return this.photoService.updateAlbum(dto, albumId, userId);
  }

  @Delete('albums/:id')
  @Auth('user')
  deleteAlbum(@Param('id') albumId: string, @User('id') userId: string) {
    return this.photoService.deleteAlbum(albumId, userId);
  }

  // photos
  @Get()
  @Auth('user')
  getAll(@User('id') userId: string) {
    return this.photoService.getAll(userId);
  }

  @Get(':id')
  getOne(@Param('id') photoId: string) {
    return this.photoService.getOne(photoId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreatePhotoDto, @User('id') userId: string) {
    return this.photoService.create(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('user')
  update(
    @Body() dto: UpdatePhotoDto,
    @Param('id') photoId: string,
    @User('id') userId: string,
  ) {
    return this.photoService.update(dto, photoId, userId);
  }

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') photoId: string, @User('id') userId: string) {
    return this.photoService.delete(photoId, userId);
  }

  // FOR COMMUNITY

  @Get('community/photo')
  getAllInCommunity(@Body() dto: FetchPhotoDto) {
    return this.photoService.getAllInCommunity(dto);
  }

  @Get('community/photo/:id')
  getOneInCommunity(@Body() dto: FetchPhotoDto, @Param('id') photoId: string) {
    return this.photoService.getOneInCommunity(dto, photoId);
  }

  @UsePipes(new ValidationPipe())
  @Post('community/photo')
  @HttpCode(200)
  @Auth('user')
  createInCommunity(@Body() dto: CreatePhotoDto, @User('id') userId: string) {
    return this.photoService.createInCommunity(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put('community/photo/:id')
  @HttpCode(200)
  @Auth('user')
  updateInCommunity(
    @Body() dto: UpdatePhotoDto,
    @Param('id') photoId: string,
    @User('id') userId: string,
  ) {
    return this.photoService.updateInCommunity(dto, photoId, userId);
  }

  @Delete('community/photo/:id')
  @Auth('user')
  deleteInCommunity(@Param('id') photoId: string, @User('id') userId: string) {
    return this.photoService.deleteInCommunity(photoId, userId);
  }
}
