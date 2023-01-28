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
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create.dto';
import { UpdateMessageDto } from './dto/update.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @Auth('user')
  getAll(@User('id') userId: string) {
    return this.messageService.getAll(userId);
  }

  @Get('recipient/:id')
  @Auth('user')
  getAllByRecipientId(
    @Param('id') recipientId: string,
    @User('id') userId: string,
  ) {
    return this.messageService.getAllByRecipientId(recipientId, userId);
  }

  @Get(':id')
  @Auth('user')
  getOneById(@Param('id') messageId: string, @User('id') userId: string) {
    return this.messageService.getOneById(messageId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreateMessageDto, @User('id') userId: string) {
    return this.messageService.create(dto, userId);
  }

  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('user')
  update(
    @Body() dto: UpdateMessageDto,
    @Param('id') messageId: string,
    @User('id') userId: string,
  ) {
    return this.messageService.update(dto, messageId, userId);
  }

  @Delete(':id')
  @Auth('user')
  delete(@Param('id') messageId: string, @User('id') userId: string) {
    return this.messageService.delete(messageId, userId);
  }
}
