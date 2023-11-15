import { Socket } from 'socket.io';
import { UserSignIn } from 'src/messages/dto/user.dto';

export class AuthenticatedSocket extends Socket {
  user?: UserSignIn;
}

export interface IGatewaySession {
  getSocket(id: number);
}
