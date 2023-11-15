import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket, IGatewaySession } from './interface';

@Injectable()
export class GatewaySessionManager implements IGatewaySession {
  private readonly sessions: Map<number, AuthenticatedSocket> = new Map();

  getSocket(id: number) {
    return this.sessions.get(id);
  }

  setUserSocket(userId: number, socket: AuthenticatedSocket) {
    return this.sessions.set(userId, socket);
  }

  removeUserSocket(userId: number) {
    return this.sessions.delete(userId);
  }

  getSockets(): Map<number, AuthenticatedSocket> {
    return this.sessions;
  }
}
