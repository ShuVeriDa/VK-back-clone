import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { User } from '../user/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCommunityDto } from './dto/create.dto';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  getAll() {
    return this.communityService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Auth('user')
  create(@Body() dto: CreateCommunityDto, @User('id') userId: string) {
    return this.communityService.create(dto, userId);
  }

  @Post('subscribe/:id')
  @UseGuards(JwtAuthGuard)
  @Auth('user')
  subscribe(@Param('id') communityId: string, @User('id') userId: string) {
    return this.communityService.subscribe(communityId, userId);
  }
}
