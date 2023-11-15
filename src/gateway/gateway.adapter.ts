// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { AuthenticatedSocket } from './interface';

// export class WebSocketAdapter extends IoAdapter {
//   createIOServer(port: number, options?: any) {
//     const server = super.createIOServer(port, options);
//     server.use(async (socket: AuthenticatedSocket, next: any) => {
//       console.log(socket.handshake.headers);
//       next();
//     });
//     return server;
//   }
// }
