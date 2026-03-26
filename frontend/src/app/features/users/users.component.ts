import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UserService, UserResponse } from '../../core/api/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container">
      <h2>Users</h2>
      <p *ngIf="error" class="error">{{ error }}</p>
      <table *ngIf="!error">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.displayName }}</td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" [class.admin]="user.role === 'ADMIN'">{{ user.role }}</span></td>
            <td>{{ user.createdAt | date:'mediumDate' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="summary" *ngIf="!error">{{ users.length }} user(s)</p>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 24px auto; padding: 0 24px; }
    h2 { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #ddd; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .role-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; background: #e8f0fe; color: #1a73e8; }
    .role-badge.admin { background: #fce4ec; color: #c62828; }
    .error { color: #c62828; background: #fce4ec; padding: 12px; border-radius: 4px; }
    .summary { color: #999; font-size: 13px; margin-top: 16px; }
  `]
})
export class UsersComponent implements OnInit {
  users: UserResponse[] = [];
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.listAdmin().subscribe({
      next: u => this.users = u,
      error: () => this.error = 'Access denied. Admin privileges required.'
    });
  }
}
