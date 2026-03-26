import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserResponse {
  id: number;
  displayName: string;
  email: string | null;
  role: string | null;
  createdAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>('/api/users');
  }

  listAdmin(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>('/api/users/admin');
  }
}
