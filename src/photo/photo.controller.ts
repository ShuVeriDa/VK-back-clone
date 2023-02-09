import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { CreatePhotoDto } from './dto/create.dto';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get()
  getAll() {
    return this.photoService.getAll();
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
}
