import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyWeather } from '../types/weather.types';
import { WeatherUtils } from '../utils/weather.utils';

@Component({
  selector: 'app-forecast-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="forecast-item"
      [class.active]="isActive"
      data-testid="forecast-item"
      tabindex="0"
      role="button"
      [attr.aria-label]="'View detailed forecast for ' + getDayName()"
      (click)="onToggle()"
      (keydown)="onKeyDown($event)"
    >
      <div class="forecast-item__day">{{ getDayName() }}</div>
      <div class="forecast-item__icon">{{ getIcon() }}</div>
      <div class="forecast-item__info">
        <div class="forecast-item__condition">{{ getCondition() }}</div>
        <div class="forecast-item__temps" data-testid="forecast-temps">
          <span class="forecast-item__high" data-testid="forecast-high">
            {{ formatTemperature(getHigh()) }}
          </span>
          <span class="forecast-item__low" data-testid="forecast-low">
            {{ formatTemperature(getLow()) }}
          </span>
        </div>
      </div>

      <div class="forecast-item__details" *ngIf="isActive">
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunrise</div>
          <div class="forecast-detail-item__value">
            {{ formatTime(daily.sunrise[index]) }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunset</div>
          <div class="forecast-detail-item__value">
            {{ formatTime(daily.sunset[index]) }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Rain</div>
          <div class="forecast-detail-item__value">
            {{ daily.rain_sum[index].toFixed(1) }} mm
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">UV Index</div>
          <div class="forecast-detail-item__value">
            {{ daily.uv_index_max[index].toFixed(1) }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Precipitation</div>
          <div class="forecast-detail-item__value">
            {{ formatPercentage(daily.precipitation_probability_max[index]) }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Temperature</div>
          <div class="forecast-detail-item__value">
            {{ formatTemperature(getLow()) }} to {{ formatTemperature(getHigh()) }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForecastItemComponent {
  @Input() daily!: DailyWeather;
  @Input() index!: number;
  @Input() isActive = false;
  @Output() toggle = new EventEmitter<number>();

  onToggle(): void {
    this.toggle.emit(this.index);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onToggle();
    }
  }

  getDayName(): string {
    return WeatherUtils.formatDate(this.daily.time[this.index]);
  }

  getIcon(): string {
    return WeatherUtils.getWeatherIcon(this.daily.weather_code[this.index]);
  }

  getCondition(): string {
    return WeatherUtils.getWeatherDescription(this.daily.weather_code[this.index]);
  }

  getHigh(): number {
    return this.daily.temperature_2m_max[this.index];
  }

  getLow(): number {
    return this.daily.temperature_2m_min[this.index];
  }

  formatTemperature = WeatherUtils.formatTemperature;
  formatTime = WeatherUtils.formatTime;
  formatPercentage = WeatherUtils.formatPercentage;
}
