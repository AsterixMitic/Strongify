import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../core/auth/state/auth.actions';
import { selectUser } from '../../core/auth/state/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private store = inject(Store);

  user = toSignal(this.store.select(selectUser), { initialValue: null });

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
