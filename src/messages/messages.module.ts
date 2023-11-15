import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from 'src/prisma/service';
import { RabbitMQModule, RabbitMQService } from 'src/libs/common/src';
import { MessagesController } from './messages.controller';
import { AccessTokenJwtStrategy } from 'src/strategies/access-token.jwt.strategy';
import { USER_SERVICE, NOTIFICATION_SERVICE } from './constants/service';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [
    RabbitMQModule.register({
      name: USER_SERVICE,
    }),
    RabbitMQModule.register({
      name: NOTIFICATION_SERVICE,
    }),
    GatewayModule,
  ],
  providers: [
    MessagesService,
    PrismaService,
    RabbitMQService,
    AccessTokenJwtStrategy,
  ],
  controllers: [MessagesController],
})
export class MessagesModule {}
