import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [NavbarComponent],
  template: `<app-navbar /><div class="container"><h2>Project Settings</h2><p>Coming soon.</p></div>`,
  styles: [`.container { max-width: 800px; margin: 24px auto; padding: 0 24px; }`]
})
export class ProjectSettingsComponent {}
