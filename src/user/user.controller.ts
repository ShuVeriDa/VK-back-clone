import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update.dto';
import { User } from './decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
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
}
