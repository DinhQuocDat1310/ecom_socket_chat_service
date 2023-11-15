import { Socket } from 'socket.io';
import { WsJwtGuard } from 'src/guards/wsJwt-auth.guard';

export const SocketAuthMiddleware = () => {
  return (client: Socket, next: any) => {
    try {
      WsJwtGuard.validateToken(client);
      next();
    } catch (error) {
      next(error);
    }
  };
};
