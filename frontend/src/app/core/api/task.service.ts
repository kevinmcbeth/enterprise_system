import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  columnId: number;
  assigneeId: number | null;
  assigneeName: string | null;
  priority: string;
  position: number;
  version: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  create(projectId: number, columnId: number, body: any): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`/api/projects/${projectId}/columns/${columnId}/tasks`, body);
  }

  update(projectId: number, taskId: number, body: any): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}`, body);
  }

  move(projectId: number, taskId: number, columnId: number, position: number, version: number): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`/api/projects/${projectId}/tasks/${taskId}/move`, { columnId, position, version });
  }

  delete(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/tasks/${taskId}`);
  }
}
