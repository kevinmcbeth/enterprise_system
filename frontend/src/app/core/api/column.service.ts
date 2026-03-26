import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoardColumnResponse {
  id: number;
  projectId: number;
  name: string;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class ColumnService {
  constructor(private http: HttpClient) {}

  list(projectId: number): Observable<BoardColumnResponse[]> {
    return this.http.get<BoardColumnResponse[]>(`/api/projects/${projectId}/columns`);
  }

  create(projectId: number, name: string): Observable<BoardColumnResponse> {
    return this.http.post<BoardColumnResponse>(`/api/projects/${projectId}/columns`, { name });
  }

  getBoard(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/projects/${projectId}/columns/board`);
  }
}
