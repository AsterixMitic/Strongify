import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUser, selectAuthStatus } from '../../core/auth/state/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private store = inject(Store);
  user = toSignal(this.store.select(selectUser), { initialValue: null });
  authStatus = toSignal(this.store.select(selectAuthStatus), { initialValue: 'loading' });
}
