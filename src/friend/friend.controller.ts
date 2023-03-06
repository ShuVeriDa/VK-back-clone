import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { FriendDto } from './dto/friend.dto';
import { User } from '../user/decorators/user.decorator';
import { CreatePostDto } from '../post/dto/create.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // All
  @Get('all')
  getAll() {
    return this.friendService.getAll();
  }

  @Get('all/:id')
  @Auth('user')
  getAllById(@Param('id') id: string, @User('id') userId: string) {
    return this.friendService.getAllById(id, userId);
  }

  //CurrentUser
  @Get()
  @Auth('user')
  getAllFriends(@User('id') userId: string) {
    return this.friendService.getAllFriends(userId);
  }

  @Get(':id')
  @Auth('user')
  getOneFriendById(@Param('id') friendId: string, @User('id') userId: string) {
    return this.friendService.getOneFriendById(friendId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post(':id')
  @HttpCode(200)
  @Auth('user')
  addFriend(@Param('id') id: string, @User('id') userId: string) {
    return this.friendService.addFriend(id, userId);
  }

  @Delete(':id')
  @Auth('user')
  removeFriend(@Param('id') friendId: string, @User('id') userId: string) {
    return this.friendService.removeFriend(friendId, userId);
  }
}
