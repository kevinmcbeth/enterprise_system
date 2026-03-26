import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';
import { TaskService, AllTasksResponse } from '../../core/api/task.service';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, PriorityBadgeComponent],
  template: `
    <app-navbar />
    <div class="container">
      <h2>All Tasks</h2>
      <div class="filters">
        <select [(ngModel)]="filterProject" (change)="applyFilters()">
          <option value="">All Projects</option>
          <option *ngFor="let p of projectNames" [value]="p">{{ p }}</option>
        </select>
        <select [(ngModel)]="filterPriority" (change)="applyFilters()">
          <option value="">All Priorities</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
          <option value="P4">P4</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Project</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let task of filteredTasks" class="task-row"
              [routerLink]="['/projects', task.projectId, 'board']">
            <td>{{ task.title }}</td>
            <td>{{ task.projectName }}</td>
            <td><span class="status-badge">{{ task.columnName }}</span></td>
            <td><app-priority-badge [priority]="task.priority" /></td>
            <td>{{ task.assigneeName || '—' }}</td>
            <td>{{ task.dueDate || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p *ngIf="filteredTasks.length === 0" class="empty">No tasks found.</p>
      <p class="summary">{{ filteredTasks.length }} task(s) across {{ projectNames.length }} project(s)</p>
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 24px auto; padding: 0 24px; }
    h2 { margin-bottom: 16px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .filters select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #ddd; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .task-row { cursor: pointer; }
    .task-row:hover { background: #f8f9fa; }
    .status-badge { background: #e8f0fe; color: #1a73e8; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
    .empty { text-align: center; color: #666; margin-top: 24px; }
    .summary { color: #999; font-size: 13px; margin-top: 16px; }
  `]
})
export class AllTasksComponent implements OnInit {
  allTasks: AllTasksResponse[] = [];
  filteredTasks: AllTasksResponse[] = [];
  projectNames: string[] = [];
  filterProject = '';
  filterPriority = '';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.allTasks().subscribe(tasks => {
      this.allTasks = tasks;
      this.projectNames = [...new Set(tasks.map(t => t.projectName))];
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredTasks = this.allTasks.filter(t => {
      if (this.filterProject && t.projectName !== this.filterProject) return false;
      if (this.filterPriority && t.priority !== this.filterPriority) return false;
      return true;
    });
  }
}
