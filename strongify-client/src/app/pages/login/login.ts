import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { LoginDto } from '../../core/auth/data/login.dto';
import { AuthActions } from '../../core/auth/state/auth.actions';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private actions$ = inject(Actions);

  constructor(private store: Store) {}

  loading = false;

  error: string | null = null;
  expired = this.route.snapshot.queryParamMap.get('expired') === 'true';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onInputString(control: 'username' | 'password', v: string | number) {
    const val = typeof v === 'number' ? String(v) : v;
    this.form.controls[control].setValue(val);
    this.form.controls[control].markAsDirty();
  }

  onSubmit() {
    if (this.loading || this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const dto: LoginDto = {
      username: this.form.value.username!,
      password: this.form.value.password!
    };

    this.store.dispatch(AuthActions.login(dto));

    // Handle success/failure via actions stream
    this.actions$
      .pipe(ofType(AuthActions.loginSuccess), take(1))
      .subscribe(() => {
        this.loading = false;
        const redirect =
          this.route.snapshot.queryParamMap.get('redirect') || '/home';
        location.assign(redirect);
      });

    this.actions$
      .pipe(ofType(AuthActions.loginFailure), take(1))
      .subscribe(({ error }) => {
        this.loading = false;
        this.error = error ?? 'Login failed';
      });
  }
}
