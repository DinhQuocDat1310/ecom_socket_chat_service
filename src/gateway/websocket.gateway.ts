import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
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
import { MessagesService } from 'src/messages/messages.service';

@WebSocketGateway(8080, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})
@UseGuards(WsJwtGuard)
export class MessagingGateway implements OnGatewayConnection {
  constructor(private readonly messagesService: MessagesService) {}
  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.rooms);
    client.emit('connected', { status: 'connected' });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessageEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: string,
  ) {
    console.log(client);
    this.server.emit('message.created', body);
  }
}
