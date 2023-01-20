import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { FriendDto } from './dto/friend.dto';
import { User } from '../user/decorators/user.decorator';
import { CreatePostDto } from '../post/entity/dto/create.dto';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UsePipes(new ValidationPipe())
  @Post(':id')
  @HttpCode(200)
  @Auth('user')
  addFriend(@Param('id') id: string, @User('id') userId: string) {
    return this.friendService.addFriend(id, userId);
  }
}
