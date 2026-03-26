import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';
import { TaskService, AllTasksResponse } from '../../core/api/task.service';
import { ProjectService, ProjectResponse } from '../../core/api/project.service';
import { ColumnService } from '../../core/api/column.service';
import { UserService, UserResponse } from '../../core/api/user.service';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, PriorityBadgeComponent],
  template: `
    <app-navbar />
    <div class="container">
      <div class="header">
        <h2>All Tasks</h2>
        <button (click)="showCreate = !showCreate">+ New Task</button>
      </div>

      <div *ngIf="showCreate" class="create-form">
        <select [(ngModel)]="newTask.projectId" class="form-field">
          <option [ngValue]="null" disabled>Select Project</option>
          <option *ngFor="let p of projects" [ngValue]="p.id">{{ p.name }}</option>
        </select>
        <input [(ngModel)]="newTask.title" placeholder="Task title" class="form-field" />
        <select [(ngModel)]="newTask.priority" class="form-field">
          <option value="P0">P0 - Critical</option>
          <option value="P1">P1 - High</option>
          <option value="P2">P2 - Medium</option>
          <option value="P3">P3 - Low</option>
          <option value="P4">P4 - Backlog</option>
        </select>
        <select [(ngModel)]="newTask.assigneeId" class="form-field">
          <option [ngValue]="null">Unassigned</option>
          <option *ngFor="let u of users" [ngValue]="u.id">{{ u.displayName }}</option>
        </select>
        <input type="date" [(ngModel)]="newTask.dueDate" class="form-field" />
        <button (click)="createTask()" [disabled]="!newTask.projectId || !newTask.title.trim()">Create</button>
      </div>

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
        <select [(ngModel)]="filterAssignee" (change)="applyFilters()">
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          <option *ngFor="let u of users" [value]="u.displayName">{{ u.displayName }}</option>
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
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .header button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; }
    h2 { margin: 0; }
    .create-form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; }
    .form-field { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .create-form button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; }
    .create-form button:disabled { background: #ccc; cursor: not-allowed; }
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
  projects: ProjectResponse[] = [];
  users: UserResponse[] = [];
  filterProject = '';
  filterPriority = '';
  filterAssignee = '';
  showCreate = false;
  newTask = { projectId: null as number | null, title: '', priority: 'P2', assigneeId: null as number | null, dueDate: '' };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private columnService: ColumnService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.projectService.list().subscribe(p => this.projects = p);
    this.userService.list().subscribe(u => this.users = u);
  }

  loadTasks() {
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
      if (this.filterAssignee === 'unassigned' && t.assigneeName) return false;
      if (this.filterAssignee && this.filterAssignee !== 'unassigned' && t.assigneeName !== this.filterAssignee) return false;
      return true;
    });
  }

  createTask() {
    if (!this.newTask.projectId || !this.newTask.title.trim()) return;

    // Get first column of the selected project
    this.columnService.list(this.newTask.projectId).subscribe(columns => {
      if (!columns.length) return;
      const firstCol = columns[0];

      this.taskService.create(this.newTask.projectId!, firstCol.id, {
        title: this.newTask.title,
        priority: this.newTask.priority,
        assigneeId: this.newTask.assigneeId,
        dueDate: this.newTask.dueDate || null
      }).subscribe(() => {
        this.newTask = { projectId: null, title: '', priority: 'P2', assigneeId: null, dueDate: '' };
        this.showCreate = false;
        this.loadTasks();
      });
    });
  }
}
