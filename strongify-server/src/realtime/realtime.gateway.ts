import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ 
  cors: { 
    origin: '*',
    credentials: true 
  } 
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server): void {
    console.log('✅ RealtimeGateway initialized');
    console.log('📍 WebSocket server path:', server.path());
  }

  handleConnection(client: Socket): void {
    console.log('🔌 Client connected:', client.id);
    console.log('   Total clients:', this.server.sockets.sockets.size);
  }

  handleDisconnect(client: Socket): void {
    console.log('❌ Client disconnected:', client.id);
    console.log('   Total clients:', this.server.sockets.sockets.size);
  }

  emitRecordCreated(payload: any) {
    if (this.server) {
      console.log('📡 Broadcasting record.created event to', this.server.sockets.sockets.size, 'clients');
      console.log('   Payload:', JSON.stringify(payload, null, 2));
      this.server.emit('record.created', payload);
    } else {
      console.warn('⚠️ WebSocket server not initialized yet');
    }
  }
}
