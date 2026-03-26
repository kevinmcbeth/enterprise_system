import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'projects', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent), canActivate: [authGuard] },
  { path: 'tasks', loadComponent: () => import('./features/all-tasks/all-tasks.component').then(m => m.AllTasksComponent), canActivate: [authGuard] },
  { path: 'projects/:id/board', loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent), canActivate: [authGuard] },
  { path: 'projects/:id/settings', loadComponent: () => import('./features/projects/project-settings/project-settings.component').then(m => m.ProjectSettingsComponent), canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
