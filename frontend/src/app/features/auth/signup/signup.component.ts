import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h2>Sign Up</h2>
      <form (ngSubmit)="onSubmit()">
        <div><label>Display Name</label><input [(ngModel)]="displayName" name="displayName" required></div>
        <div><label>Email</label><input type="email" [(ngModel)]="email" name="email" required></div>
        <div><label>Password</label><input type="password" [(ngModel)]="password" name="password" required minlength="8"></div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </div>
  `,
  styles: [`
    .auth-container { max-width: 400px; margin: 80px auto; padding: 24px; }
    form div { margin-bottom: 16px; }
    label { display: block; margin-bottom: 4px; font-weight: 600; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #1a73e8; color: white; border: none; cursor: pointer; }
    .error { color: red; }
  `]
})
export class SignupComponent {
  displayName = '';
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.authService.signup(this.email, this.password, this.displayName).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => this.error = err.error?.message || 'Signup failed'
    });
  }
}
