import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../feature/user/user.service';
import { selectUser } from '../../../core/auth/state/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthActions } from '../../../core/auth/state/auth.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-update',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-update.html',
  styleUrl: './user-update.scss'
})
export class UserUpdate implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private sub = new Subscription();

  loading = false;
  error: string | null = null;
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    // Subscribe to user changes and populate form
    this.sub.add(
      this.store.select(selectUser).subscribe(user => {
        if (user && !this.form.value.username) {
          this.form.patchValue({
            username: user.username,
            email: user.email
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onInputString(control: 'username' | 'email', v: string | number) {
    const val = typeof v === 'number' ? String(v) : v;
    this.form.controls[control].setValue(val);
    this.form.controls[control].markAsDirty();
  }

  onSubmit() {
    if (this.loading || this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const username = this.form.value.username!;
    const email = this.form.value.email!;

    this.userService.updateUser({ username, email }, this.selectedFile ?? undefined)
      .subscribe({
        next: () => {
          this.store.dispatch(AuthActions.loadUser());
          this.router.navigate(['/user/profile']);
        },
        error: (err) => {
          this.error =
            err?.friendlyMessage ||
            (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
            'An error occurred while updating the user';
          this.loading = false;
        }
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = null;
    }
  }

  removeAvatar() {
    this.selectedFile = null;
  }

  onCancel() {
    this.router.navigate(['/user/profile']);
  }
}