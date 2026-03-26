import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriorityBadgeComponent } from '../../../shared/priority-badge/priority-badge.component';
import { TaskResponse, TaskService } from '../../../core/api/task.service';
import { CommentService, CommentResponse } from '../../../core/api/comment.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PriorityBadgeComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ task.title }}</h3>
          <button class="close-btn" (click)="close.emit()">&times;</button>
        </div>
        <div class="modal-body">
          <app-priority-badge [priority]="task.priority" />
          <p *ngIf="task.description">{{ task.description }}</p>
          <p *ngIf="task.assigneeName"><strong>Assignee:</strong> {{ task.assigneeName }}</p>
          <p *ngIf="task.dueDate"><strong>Due:</strong> {{ task.dueDate }}</p>

          <button class="delete-btn" (click)="deleteTask()">Delete Task</button>

          <h4>Comments</h4>
          <div *ngFor="let c of comments" class="comment">
            <strong>{{ c.authorName }}</strong>
            <p>{{ c.body }}</p>
            <small>{{ c.createdAt | date:'short' }}</small>
          </div>
          <div class="add-comment">
            <textarea [(ngModel)]="newComment" placeholder="Add a comment..."></textarea>
            <button (click)="addComment()">Post</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 500px; max-height: 80vh; overflow-y: auto; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
    .comment { border-top: 1px solid #eee; padding: 8px 0; }
    .add-comment textarea { width: 100%; padding: 8px; box-sizing: border-box; min-height: 60px; }
    .add-comment button { margin-top: 8px; background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .delete-btn { background: #dc3545; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; margin-top: 12px; }
  `]
})
export class TaskDetailComponent implements OnInit {
  @Input() task!: TaskResponse;
  @Input() projectId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<TaskResponse>();

  comments: CommentResponse[] = [];
  newComment = '';

  constructor(private commentService: CommentService, private taskService: TaskService) {}

  ngOnInit() {
    this.commentService.list(this.projectId, this.task.id).subscribe(
      (page: any) => this.comments = page.content
    );
  }

  deleteTask() {
    if (confirm('Delete this task?')) {
      this.taskService.delete(this.projectId, this.task.id).subscribe(() => {
        this.deleted.emit(this.task);
      });
    }
  }

  addComment() {
    if (!this.newComment.trim()) return;
    this.commentService.create(this.projectId, this.task.id, this.newComment).subscribe(c => {
      this.comments.unshift(c);
      this.newComment = '';
    });
  }
}
