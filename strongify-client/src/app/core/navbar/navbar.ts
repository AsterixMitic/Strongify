import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../auth/state/auth.actions';
import { selectUser, selectIsAuth } from '../auth/state/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private store = inject(Store);

  user = toSignal(this.store.select(selectUser), { initialValue: null });
  isAuthenticated = toSignal(this.store.select(selectIsAuth), { initialValue: false });

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
