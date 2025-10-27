import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthActions } from '../../../core/auth/state/auth.actions';
import { selectUser } from '../../../core/auth/state/auth.selectors';
import { UserDto } from '../../../feature/user/data/user.dto';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private sub = new Subscription();
  
  user = toSignal(this.store.select(selectUser), { initialValue: null });

  ngOnInit() {
    // Just listen to user changes without triggering loads
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onUpdateProfile() {
    if (!this.user()) return;
    this.router.navigate(['/user/update']);
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }
}