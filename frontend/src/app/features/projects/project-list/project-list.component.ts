import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ProjectService, ProjectResponse } from '../../../core/api/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div class="container">
      <div class="header">
        <h2>Projects</h2>
        <button (click)="showCreate = !showCreate">+ New Project</button>
      </div>
      <div *ngIf="showCreate" class="create-form">
        <input [(ngModel)]="newName" placeholder="Project name" />
        <input [(ngModel)]="newDescription" placeholder="Description (optional)" />
        <button (click)="create()">Create</button>
      </div>
      <div *ngFor="let project of projects" class="project-card">
        <a [routerLink]="['/projects', project.id, 'board']">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <small>{{ project.members.length }} member(s)</small>
        </a>
      </div>
      <p *ngIf="projects.length === 0">No projects yet. Create one to get started.</p>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 24px auto; padding: 0 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .header button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .create-form { display: flex; gap: 8px; margin-bottom: 16px; }
    .create-form input { flex: 1; padding: 8px; }
    .create-form button { background: #1a73e8; color: white; border: none; padding: 8px 16px; cursor: pointer; }
    .project-card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .project-card a { text-decoration: none; color: inherit; }
    .project-card h3 { margin: 0 0 4px; }
    .project-card p { margin: 0 0 4px; color: #666; }
  `]
})
export class ProjectListComponent implements OnInit {
  projects: ProjectResponse[] = [];
  showCreate = false;
  newName = '';
  newDescription = '';

  constructor(private projectService: ProjectService) {}

  ngOnInit() { this.load(); }

  load() {
    this.projectService.list().subscribe(p => this.projects = p);
  }

  create() {
    if (!this.newName.trim()) return;
    this.projectService.create(this.newName, this.newDescription).subscribe(() => {
      this.newName = '';
      this.newDescription = '';
      this.showCreate = false;
      this.load();
    });
  }
}
