import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav>
      <div class="nav-links">
        <a routerLink="/projects">Projects</a>
        <a routerLink="/tasks">All Tasks</a>
        <a routerLink="/users">Users</a>
      </div>
      <button (click)="logout()">Logout</button>
    </nav>
  `,
  styles: [`
    nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #1a73e8; color: white; }
    .nav-links { display: flex; gap: 20px; }
    a { color: white; text-decoration: none; font-weight: 600; }
    button { background: transparent; color: white; border: 1px solid white; padding: 6px 12px; cursor: pointer; }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); window.location.href = '/login'; }
}
