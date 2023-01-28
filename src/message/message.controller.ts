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
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from '../user/decorators/user.decorator';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @Auth('user')
  getAll(@User('id') userId: string) {
    return this.messageService.getAll(userId);
  }

  @Get(':id')
  @Auth()
  getAllByRecipientId(
    @Param('id') recipientId: string,
    @User('id') userId: string,
  ) {
    return this.messageService.getAllByRecipientId(recipientId, userId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(200)
  @Auth('user')
  create(@Body() dto: CreateMessageDto, @User('id') userId: string) {
    return this.messageService.create(dto, userId);
  }
}
