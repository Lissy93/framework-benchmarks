import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../types/weather.types';
import { ForecastItemComponent } from './forecast-item.component';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, ForecastItemComponent],
  template: `
    <section class="forecast-section" *ngIf="weatherData">
      <h2 class="section-title">7-Day Forecast</h2>
      <div class="forecast">
        <div class="forecast__list" data-testid="forecast-list">
          <app-forecast-item
            *ngFor="let date of weatherData.daily.time; let i = index"
            [daily]="weatherData.daily"
            [index]="i"
            [isActive]="activeForecastIndex === i"
            (toggle)="onToggleForecast($event)"
          ></app-forecast-item>
        </div>
      </div>
    </section>
  `
})
export class ForecastComponent implements AfterViewInit {
  @Input() weatherData: WeatherData | null = null;
  activeForecastIndex: number | null = null;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    // Component is ready
  }

  onToggleForecast(index: number): void {
    if (this.activeForecastIndex === index) {
      this.activeForecastIndex = null;
    } else {
      this.activeForecastIndex = index;
      // Smooth scroll to the expanded item
      setTimeout(() => {
        const activeElement = this.elementRef.nativeElement.querySelector('.forecast-item.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }
}
