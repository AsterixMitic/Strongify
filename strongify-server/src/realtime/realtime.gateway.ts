import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {

  }

  emitRecordCreated(payload: any) {
    if (this.server) {
      this.server.emit('record.created', payload);
    }
  }
}
