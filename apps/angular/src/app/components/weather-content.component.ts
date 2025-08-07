import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../types/weather.types';
import { CurrentWeatherComponent } from './current-weather.component';
import { ForecastComponent } from './forecast.component';

@Component({
  selector: 'app-weather-content',
  standalone: true,
  imports: [CommonModule, CurrentWeatherComponent, ForecastComponent],
  template: `
    <div
      class="weather-content"
      data-testid="weather-content"
      [hidden]="!isVisible"
    >
      <div class="weather-layout">
        <app-current-weather [weatherData]="weatherData"></app-current-weather>
        <app-forecast [weatherData]="weatherData"></app-forecast>
      </div>
    </div>
  `
})
export class WeatherContentComponent {
  @Input() isVisible = false;
  @Input() weatherData: WeatherData | null = null;
}
