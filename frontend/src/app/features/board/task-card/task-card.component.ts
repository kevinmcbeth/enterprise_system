import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriorityBadgeComponent } from '../../../shared/priority-badge/priority-badge.component';
import { TaskResponse } from '../../../core/api/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, PriorityBadgeComponent],
  template: `
    <div class="card" (click)="clicked.emit(task)">
      <div class="card-header">
        <app-priority-badge [priority]="task.priority" />
      </div>
      <h4>{{ task.title }}</h4>
      <div class="card-footer">
        <span *ngIf="task.assigneeName" class="assignee">{{ task.assigneeName }}</span>
        <span *ngIf="task.dueDate" class="due">{{ task.dueDate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 12px; cursor: pointer; margin-bottom: 8px; }
    .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h4 { margin: 8px 0 4px; font-size: 14px; }
    .card-footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
    .assignee { background: #e8f0fe; padding: 2px 8px; border-radius: 12px; }
  `]
})
export class TaskCardComponent {
  @Input() task!: TaskResponse;
  @Output() clicked = new EventEmitter<TaskResponse>();
}
