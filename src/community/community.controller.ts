import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommunityService } from './community.service';
import { User } from '../user/decorators/user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCommunityDto } from './dto/create.dto';
import { AddAdminCommunityDto } from './dto/addAdmin.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  getAll() {
    return this.communityService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') communityId: string) {
    return this.communityService.getOne(communityId);
  }

  @Post()
  @Auth('user')
  create(@Body() dto: CreateCommunityDto, @User('id') userId: string) {
    return this.communityService.create(dto, userId);
  }

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') communityId: string, @User('id') userId: string) {
    return this.communityService.delete(communityId, userId);
  }
  @Post('subscribe/:id')
  @Auth('user')
  subscribe(@Param('id') communityId: string, @User('id') userId: string) {
    return this.communityService.subscribe(communityId, userId);
  }

  @Delete('unsubscribe/:id')
  @Auth('user')
  unsubscribe(@Param('id') communityId: string, @User('id') userId: string) {
    return this.communityService.unsubscribe(communityId, userId);
  }

  @Post('admin/:id')
  @Auth('user')
  addAdmin(
    @Body() dto: AddAdminCommunityDto,
    @Param('id') communityId: string,
    @User('id') userId: string,
  ) {
    return this.communityService.addAdmin(dto, communityId, userId);
  }

  @Delete('admin/:id')
  @Auth('user')
  removeFromAdmin(
    @Body() dto: AddAdminCommunityDto,
    @Param('id') communityId: string,
    @User('id') userId: string,
  ) {
    return this.communityService.removeFromAdmin(dto, communityId, userId);
  }
}
