import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update.dto';
import { User } from './decorators/user.decorator';
import { SearchCommunityDto } from '../community/dto/search.dto';
import { SearchUserDto } from './dto/search.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get('search')
  @Auth('user')
  search(@Query() dto: SearchUserDto, @User('id') userId: string) {
    return this.userService.search(dto, userId);
  }

  @Get(':id')
  getOneUser(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  @Auth('user')
  updateUser(
    @Param('id') userIdToChange: string,
    @User('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userIdToChange, userId, dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Delete(':id')
  @Auth('user')
  removeUser(@Param('id') userIdToChange: string, @User('id') userId: string) {
    return this.userService.removeUser(userIdToChange, userId);
  }

  @UsePipes(new ValidationPipe())
  @Patch('friend/:id')
  @HttpCode(200)
  @Auth('user')
  addFriend(@Param('id') friendId: string, @User('id') userId: string) {
    return this.userService.addFriend(friendId, userId);
  }

  @Delete('friend/:id')
  @Auth('user')
  removeFriend(@Param('id') friendId: string, @User('id') userId: string) {
    return this.userService.removeFriend(friendId, userId);
  }
}
