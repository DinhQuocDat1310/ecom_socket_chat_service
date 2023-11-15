import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/guards/wsJwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { SocketAuthMiddleware } from 'src/middleware/ws.middleware';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
  },
})
@UseGuards(WsJwtGuard)
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.rooms);
    client.emit('connected', { status: 'connected' });
  }

  @WebSocketServer()
  server: Server<any, any>;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create message', data);
  }

  @OnEvent('message.create')
  handleMessageEventCreate(payload: any) {
    this.server.emit('onMessage', payload);
  }
}
