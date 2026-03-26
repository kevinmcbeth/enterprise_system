import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  members: MemberInfo[];
}

export interface MemberInfo {
  userId: number;
  displayName: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  list(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>('/api/projects');
  }

  get(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`/api/projects/${id}`);
  }

  create(name: string, description: string): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>('/api/projects', { name, description });
  }

  update(id: number, name: string, description: string): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`/api/projects/${id}`, { name, description });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${id}`);
  }

  addMember(projectId: number, email: string): Observable<void> {
    return this.http.post<void>(`/api/projects/${projectId}/members`, { email });
  }

  removeMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/members/${userId}`);
  }
}
