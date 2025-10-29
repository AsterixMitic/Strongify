import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './core/navbar/navbar';
import { Store } from '@ngrx/store';
import { selectIsAuth } from './core/auth/state/auth.selectors';
import { WebSocketService } from './core/services/websocket.service';
import { RealtimeService } from './core/services/realtime.service';
import { NotificationService } from './core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('strongify-client');
  
  private store = inject(Store);
  private wsService = inject(WebSocketService);
  private realtimeService = inject(RealtimeService);
  private notificationService = inject(NotificationService);
  private authSub: Subscription | null = null;

  ngOnInit() {
    // Set up WebSocket event listeners
    this.setupWebSocketListeners();

    // Connect to WebSocket when user is authenticated
    this.authSub = this.store.select(selectIsAuth).subscribe((isAuth) => {
      if (isAuth) {
        console.log('🔐 User authenticated, connecting WebSocket...');
        this.wsService.connect();
      } else {
        console.log('🔐 User not authenticated, disconnecting WebSocket...');
        this.wsService.disconnect();
      }
    });
  }

  private setupWebSocketListeners() {
    // Listen for record.created events from WebSocket
    this.wsService.on('record.created', (payload: any) => {
      console.log('📨 Received record.created event:', payload);
      
      // Broadcast to all components via RealtimeService
      this.realtimeService.emitRecordCreated(payload);
      
      // Show notification dialog to user
      this.notificationService.showRecordCreatedDialog({
        exerciseName: payload?.exerciseType?.name || payload?.exercise || 'Exercise',
        locationName: payload?.location?.name,
        reps: payload?.reps,
        weightKg: payload?.weightKg,
        durationSec: payload?.durationSec,
        rpe: payload?.rpe,
        userName: payload?.user?.username || payload?.user?.name,
        createdAt: payload?.createdAt
      });
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    this.wsService.off('record.created');
    this.wsService.disconnect();
  }
}
