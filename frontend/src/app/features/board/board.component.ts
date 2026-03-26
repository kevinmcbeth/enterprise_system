import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { BoardColumnComponent } from './board-column/board-column.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { ColumnService, BoardColumnResponse } from '../../core/api/column.service';
import { TaskService, TaskResponse } from '../../core/api/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, NavbarComponent, BoardColumnComponent, TaskDetailComponent],
  template: `
    <app-navbar />
    <div class="board-container">
      <div class="board-header">
        <h2>Board</h2>
        <div class="add-task">
          <input [(ngModel)]="newTaskTitle" placeholder="New task title..." />
          <button (click)="createTask()" [disabled]="!newTaskTitle.trim()">Add Task</button>
        </div>
      </div>
      <div class="board">
        <app-board-column *ngFor="let col of columns"
          [columnId]="col.id"
          [name]="col.name"
          [tasks]="tasksByColumn[col.id] || []"
          [connectedLists]="connectedListIds"
          (dropped)="onDrop($event, col.id)"
          (taskClicked)="selectedTask = $event" />
      </div>
    </div>
    <app-task-detail *ngIf="selectedTask"
      [task]="selectedTask"
      [projectId]="projectId"
      (close)="selectedTask = null"
      (deleted)="onTaskDeleted($event)" />
  `,
  styles: [`
    .board-container { padding: 24px; }
    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .add-task { display: flex; gap: 8px; }
    .add-task input { padding: 8px; width: 250px; }
    .add-task button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .board { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 24px; }
  `]
})
export class BoardComponent implements OnInit {
  projectId!: number;
  columns: BoardColumnResponse[] = [];
  tasksByColumn: Record<number, TaskResponse[]> = {};
  connectedListIds: string[] = [];
  selectedTask: TaskResponse | null = null;
  newTaskTitle = '';

  constructor(
    private route: ActivatedRoute,
    private columnService: ColumnService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBoard();
  }

  loadBoard() {
    this.columnService.getBoard(this.projectId).subscribe(columns => {
      this.columns = columns.map(c => ({ id: c.id, projectId: this.projectId, name: c.name, position: c.position }));
      this.connectedListIds = columns.map((c: any) => 'col-' + c.id);
      this.tasksByColumn = {};
      columns.forEach((c: any) => this.tasksByColumn[c.id] = c.tasks || []);
    });
  }

  createTask() {
    if (!this.columns.length || !this.newTaskTitle.trim()) return;
    const firstColumn = this.columns[0];
    this.taskService.create(this.projectId, firstColumn.id, {
      title: this.newTaskTitle,
      priority: 'P2'
    }).subscribe(task => {
      if (!this.tasksByColumn[firstColumn.id]) {
        this.tasksByColumn[firstColumn.id] = [];
      }
      this.tasksByColumn[firstColumn.id].push(task);
      this.newTaskTitle = '';
    });
  }

  onTaskDeleted(task: TaskResponse) {
    Object.values(this.tasksByColumn).forEach(tasks => {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx >= 0) tasks.splice(idx, 1);
    });
    this.selectedTask = null;
  }

  onDrop(event: CdkDragDrop<TaskResponse[]>, targetColumnId: number) {
    const task: TaskResponse = event.item.data;
    const newPosition = event.currentIndex * 1000;

    this.taskService.move(this.projectId, task.id, targetColumnId, newPosition, task.version)
      .subscribe({
        next: (updated) => {
          // Remove from old column
          Object.values(this.tasksByColumn).forEach(tasks => {
            const idx = tasks.findIndex(t => t.id === task.id);
            if (idx >= 0) tasks.splice(idx, 1);
          });
          // Add to new column
          if (!this.tasksByColumn[targetColumnId]) {
            this.tasksByColumn[targetColumnId] = [];
          }
          this.tasksByColumn[targetColumnId].splice(event.currentIndex, 0, updated);
        },
        error: () => {
          // Conflict — reload board
          this.loadBoard();
        }
      });
  }
}
