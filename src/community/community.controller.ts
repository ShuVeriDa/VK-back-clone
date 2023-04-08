import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { User } from '../user/decorators/user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CreateCommunityDto } from './dto/create.dto';
import { AddAdminCommunityDto } from './dto/addAdmin.dto';
import { SearchCommunityDto } from './dto/search.dto';
import { SearchMemberCommunityDto } from './dto/searchMember.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  getAll() {
    return this.communityService.getAll();
  }

  @Get('search')
  @Auth('user')
  search(@Query() dto: SearchCommunityDto, @User('id') userId: string) {
    return this.communityService.search(dto, userId);
  }

  @Get('search/:id/members')
  searchMember(
    @Query() dto: SearchMemberCommunityDto,
    @Param('id') communityId: string,
  ) {
    return this.communityService.searchMember(dto, communityId);
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

  @Delete('subscribe/:id')
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
