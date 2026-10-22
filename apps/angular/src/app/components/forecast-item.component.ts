import { Component, ElementRef, Injector, afterNextRender, computed, inject, input, output } from '@angular/core';
import type { DailyWeather } from '../types/weather.types';
import { WeatherUtils } from '../utils/weather.utils';

@Component({
  selector: 'app-forecast-item',
  template: `
    <div
      class="forecast-item"
      [class.active]="isActive()"
      data-testid="forecast-item"
      tabindex="0"
      role="button"
      [attr.aria-label]="ariaLabel()"
      (click)="onToggle()"
      (keydown)="onKeyDown($event)"
    >
      <div class="forecast-item__day">{{ dayName() }}</div>
      <div class="forecast-item__icon">{{ icon() }}</div>
      <div class="forecast-item__info">
        <div class="forecast-item__condition">{{ condition() }}</div>
        <div class="forecast-item__temps" data-testid="forecast-temps">
          <span class="forecast-item__high" data-testid="forecast-high">
            {{ highTemperature() }}
          </span>
          <span class="forecast-item__low" data-testid="forecast-low">
            {{ lowTemperature() }}
          </span>
        </div>
      </div>

      @if (isActive()) {
        <div class="forecast-item__details">
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunrise</div>
          <div class="forecast-detail-item__value">
            {{ sunrise() }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunset</div>
          <div class="forecast-detail-item__value">
            {{ sunset() }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Rain</div>
          <div class="forecast-detail-item__value">
            {{ rainAmount() }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">UV Index</div>
          <div class="forecast-detail-item__value">
            {{ uvIndex() }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Precipitation</div>
          <div class="forecast-detail-item__value">
            {{ precipitationProbability() }}
          </div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Temperature</div>
          <div class="forecast-detail-item__value">
            {{ temperatureRange() }}
          </div>
        </div>
        </div>
      }
    </div>
  `
})
export class ForecastItemComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly daily = input.required<DailyWeather>();
  readonly index = input.required<number>();
  readonly isActive = input(false);
  readonly toggle = output<number>();

  readonly dayName = computed(() => WeatherUtils.formatDate(this.daily().time[this.index()]));
  readonly ariaLabel = computed(() => `View detailed forecast for ${this.dayName()}`);
  readonly icon = computed(() => WeatherUtils.getWeatherIcon(this.daily().weather_code[this.index()]));
  readonly condition = computed(() => WeatherUtils.getWeatherDescription(this.daily().weather_code[this.index()]));
  readonly high = computed(() => this.daily().temperature_2m_max[this.index()]);
  readonly low = computed(() => this.daily().temperature_2m_min[this.index()]);
  readonly highTemperature = computed(() => WeatherUtils.formatTemperature(this.high()));
  readonly lowTemperature = computed(() => WeatherUtils.formatTemperature(this.low()));
  readonly sunrise = computed(() => WeatherUtils.formatTime(this.daily().sunrise[this.index()]));
  readonly sunset = computed(() => WeatherUtils.formatTime(this.daily().sunset[this.index()]));
  readonly rainAmount = computed(() => `${this.daily().rain_sum[this.index()].toFixed(1)} mm`);
  readonly uvIndex = computed(() => this.daily().uv_index_max[this.index()].toFixed(1));
  readonly precipitationProbability = computed(() =>
    WeatherUtils.formatPercentage(this.daily().precipitation_probability_max[this.index()])
  );
  readonly temperatureRange = computed(() => `${this.lowTemperature()} to ${this.highTemperature()}`);

  onToggle(): void {
    this.toggle.emit(this.index());
    // Scroll from the item itself, a viewChildren query in the parent adds the query runtime to the bundle
    afterNextRender(() => {
      if (this.isActive()) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, { injector: this.injector });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onToggle();
    }
  }
}
