import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentResponse {
  id: number;
  body: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  list(projectId: number, taskId: number, page = 0, size = 20): Observable<any> {
    return this.http.get(`/api/projects/${projectId}/tasks/${taskId}/comments?page=${page}&size=${size}`);
  }

  create(projectId: number, taskId: number, body: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`/api/projects/${projectId}/tasks/${taskId}/comments`, { body });
  }
}
