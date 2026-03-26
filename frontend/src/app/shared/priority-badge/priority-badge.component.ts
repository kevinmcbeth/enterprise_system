import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="priority">{{ priority }}</span>`,
  styles: [`
    .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .P0 { background: #dc3545; color: white; }
    .P1 { background: #fd7e14; color: white; }
    .P2 { background: #ffc107; color: black; }
    .P3 { background: #6c757d; color: white; }
    .P4 { background: #e9ecef; color: black; }
  `]
})
export class PriorityBadgeComponent {
  @Input() priority = 'P2';
}
