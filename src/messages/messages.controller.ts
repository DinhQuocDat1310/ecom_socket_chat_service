import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessJwtAuthGuard } from 'src/guards/jwt-access-auth.guard';
import {
  PrivateConversationDTO,
  GroupConversationDTO,
} from './dto/conversation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageDTO } from './dto/message.dto';

@Controller('messages')
@UseGuards(AccessJwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Message Chat')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiBody({ type: PrivateConversationDTO })
  @Post('/conversation')
  async createConversation(
    @Request() userReq: any,
    @Body() conversationDto: PrivateConversationDTO,
  ) {
    return await this.messagesService.createPrivateConversation(
      userReq.user,
      conversationDto,
    );
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiOperation({ summary: 'Find my conversation with Title' })
  @Get('/conversation')
  async findConversation(
    @Request() userReq: any,
    @Query('title') title: string,
  ) {
    return await this.messagesService.findConversationByTitle(
      userReq.user,
      title,
    );
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiOperation({
    summary: 'Create group conversation',
  })
  @Post('/conversation/group')
  async createGroupConversation(
    @Request() userReq: any,
    @Body() conversationDto: GroupConversationDTO,
  ) {
    return await this.messagesService.createGroupConversation(
      userReq.user,
      conversationDto,
    );
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: MessageDTO })
  @Post('')
  async createMessage(@Request() userReq: any, @Body() messageDto: MessageDTO) {
    const message = await this.messagesService.createMessage(
      userReq.user,
      messageDto,
    );
    this.eventEmitter.emit('message.create', message);
    return message;
  }
}
