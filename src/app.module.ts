import { Module } from '@nestjs/common';
import { MessagesModule } from './messages/messages.module';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from './gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MessagesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.rabbitmq', '.env'],
    }),
    GatewayModule,
    EventEmitterModule.forRoot({}),
  ],
  providers: [],
})
export class AppModule {}
