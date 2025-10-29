import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environment/environment';
import { BehaviorSubject, Observable } from 'rxjs';

interface EventListener {
  event: string;
  callback: (...args: any[]) => void;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private _connected$ = new BehaviorSubject<boolean>(false);
  public connected$ = this._connected$.asObservable();
  private pendingListeners: EventListener[] = [];

  connect() {
    // If already connected, do nothing
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      this.registerPendingListeners();
      return;
    }

    // If socket exists but not connected, try to reconnect
    if (this.socket && !this.socket.connected) {
      console.log('🔄 Reconnecting existing socket...');
      this.socket.connect();
      return;
    }

    try {
      console.log('🔌 Attempting to connect to WebSocket:', environment.apiUrl);
      this.socket = io(environment.apiUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected, socket ID:', this.socket?.id);
        this._connected$.next(true);
        this.registerPendingListeners();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this._connected$.next(false);
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('⚠️ WebSocket disconnected:', reason);
        this._connected$.next(false);
      });
    } catch (err) {
      console.error('❌ Socket initialization failed:', err);
    }
  }

  private registerPendingListeners() {
    if (this.pendingListeners.length > 0 && this.socket) {
      console.log('📝 Registering', this.pendingListeners.length, 'pending event listeners');
      this.pendingListeners.forEach(({ event, callback }) => {
        // Remove any existing listener first to avoid duplicates
        this.socket?.off(event, callback);
        // Then register the listener
        this.socket?.on(event, callback);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._connected$.next(false);
      console.log('🔌 WebSocket disconnected');
    }
  }

  on<T = any>(event: string, callback: (data: T) => void): void {
    // Store the listener
    const listener = { event, callback };
    
    // Check if this listener already exists
    const exists = this.pendingListeners.some(
      l => l.event === event && l.callback === callback
    );
    
    if (!exists) {
      this.pendingListeners.push(listener);
    }

    // If socket is already connected, register immediately
    if (this.socket?.connected) {
      console.log('📝 Registering event listener for:', event);
      this.socket.on(event, callback);
    } else {
      console.log('📝 Queueing event listener for:', event, '(socket not connected yet)');
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    // Remove from pending listeners
    if (callback) {
      this.pendingListeners = this.pendingListeners.filter(
        l => !(l.event === event && l.callback === callback)
      );
    } else {
      this.pendingListeners = this.pendingListeners.filter(l => l.event !== event);
    }

    // Remove from socket if connected
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot emit event:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

