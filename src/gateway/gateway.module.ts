import { Module } from '@nestjs/common';
import { MessagingGateway } from './websocket.gateway';
import { MessagesService } from 'src/messages/messages.service';
import { RabbitMQModule } from 'src/libs/common/src';
import {
  NOTIFICATION_SERVICE,
  USER_SERVICE,
} from 'src/messages/constants/service';
import { PrismaService } from 'src/prisma/service';

@Module({
  imports: [
    RabbitMQModule.register({
      name: USER_SERVICE,
    }),
    RabbitMQModule.register({
      name: NOTIFICATION_SERVICE,
    }),
  ],
  providers: [MessagingGateway, MessagesService, PrismaService],
})
export class GatewayModule {}
