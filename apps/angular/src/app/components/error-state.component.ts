import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="error" 
      data-testid="error" 
      [hidden]="!isVisible"
    >
      <h2 class="error__title">Unable to load weather data</h2>
      <p class="error__message">
        {{ message || 'Please check the city name and try again.' }}
      </p>
    </div>
  `
})
export class ErrorStateComponent {
  @Input() isVisible = false;
  @Input() message: string | null = null;
}