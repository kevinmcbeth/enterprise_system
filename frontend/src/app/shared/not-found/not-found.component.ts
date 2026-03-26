import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="container"><h2>404 — Page Not Found</h2><a routerLink="/projects">Back to Projects</a></div>`,
  styles: [`.container { text-align: center; margin-top: 80px; } a { color: #1a73e8; }`]
})
export class NotFoundComponent {}
