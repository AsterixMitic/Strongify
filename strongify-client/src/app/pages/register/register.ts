import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserCreateDto } from '../../feature/user/data/user-create.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  error: string | null = null;

  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    passwordHash: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  onInputString(
    control: 'username' | 'email' | 'passwordHash' | 'confirmPassword',
    v: string | number
  ) {
    const val = typeof v === 'number' ? String(v) : v;
    this.form.controls[control].setValue(val);
    this.form.controls[control].markAsDirty();
  }

  onSubmit() {
    if (this.loading || this.form.invalid) return;

    const passwordHash = this.form.value.passwordHash!;
    const confirmPassword = this.form.value.confirmPassword!;

    if (passwordHash !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto: UserCreateDto = {
      username: this.form.value.username!,
      email: this.form.value.email!,
      passwordHash
    };

    this.authService.register(dto, this.selectedFile ?? undefined)
      .subscribe({
        next: () => {
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        },
        error: (err) => {
          this.error =
            err?.friendlyMessage ||
            (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
            err?.message ||
            'Registration failed';
          this.loading = false;
        }
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file';
        return;
      }

      // Validate file size (5MB)
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
}
