import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="loading" 
      data-testid="loading" 
      [hidden]="!isVisible"
    >
      <div class="loading__spinner"></div>
      <p>Loading weather data...</p>
    </div>
  `
})
export class LoadingStateComponent {
  @Input() isVisible = false;
}