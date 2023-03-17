import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from '../../src/auth/decorators/auth.decorator';
import { User } from '../../src/user/decorators/user.decorator';

// @Controller('friends')
// export class FriendController {
//   constructor(private readonly friendService: FriendService) {}
//
//   // All
//   @Get('all')
//   getAll() {
//     return this.friendService.getAll();
//   }
//
//   @Get('all/:id')
//   @Auth('user')
//   getAllById(@Param('id') id: string, @User('id') userId: string) {
//     return this.friendService.getAllById(id, userId);
//   }
//
//   //CurrentUser
//   @Get()
//   @Auth('user')
//   getAllFriends(@User('id') userId: string) {
//     return this.friendService.getAllFriends(userId);
//   }
//
//   @Get(':id')
//   @Auth('user')
//   getOneFriendById(@Param('id') friendId: string, @User('id') userId: string) {
//     return this.friendService.getOneFriendById(friendId, userId);
//   }
//
//   @UsePipes(new ValidationPipe())
//   @Post(':id')
//   @HttpCode(200)
//   @Auth('user')
//   addFriend(@Param('id') id: string, @User('id') userId: string) {
//     return this.friendService.addFriend(id, userId);
//   }
//
//   @Delete(':id')
//   @Auth('user')
//   removeFriend(@Param('id') friendId: string, @User('id') userId: string) {
//     return this.friendService.removeFriend(friendId, userId);
//   }
// }
