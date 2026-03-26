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
      <a routerLink="/projects">Projects</a>
      <button (click)="logout()">Logout</button>
    </nav>
  `,
  styles: [`
    nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #1a73e8; color: white; }
    a { color: white; text-decoration: none; font-weight: 600; }
    button { background: transparent; color: white; border: 1px solid white; padding: 6px 12px; cursor: pointer; }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}
  logout() { this.authService.logout(); window.location.href = '/login'; }
}
