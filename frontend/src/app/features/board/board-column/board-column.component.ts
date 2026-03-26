import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskResponse } from '../../../core/api/task.service';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
  template: `
    <div class="column">
      <h3>{{ name }}</h3>
      <div cdkDropList [cdkDropListData]="tasks" [id]="'col-' + columnId"
           [cdkDropListConnectedTo]="connectedLists"
           (cdkDropListDropped)="dropped.emit($event)" class="task-list">
        <div *ngFor="let task of tasks" cdkDrag [cdkDragData]="task">
          <app-task-card [task]="task" (clicked)="taskClicked.emit($event)" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .column { background: #f4f5f7; border-radius: 8px; padding: 12px; min-width: 280px; max-width: 280px; }
    h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #5e6c84; }
    .task-list { min-height: 40px; }
  `]
})
export class BoardColumnComponent {
  @Input() columnId!: number;
  @Input() name!: string;
  @Input() tasks: TaskResponse[] = [];
  @Input() connectedLists: string[] = [];
  @Output() dropped = new EventEmitter<CdkDragDrop<TaskResponse[]>>();
  @Output() taskClicked = new EventEmitter<TaskResponse>();
}
