import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../types/weather.types';
import { WeatherUtils } from '../utils/weather.utils';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="current-section" *ngIf="weatherData">
      <h2 class="section-title">Current Weather</h2>
      <div class="weather-card" data-testid="current-weather">
        <div class="current-weather">
          <h3 class="current-weather__location" data-testid="current-location">
            {{ weatherData.locationName }}{{ weatherData.country ? ', ' + weatherData.country : '' }}
          </h3>
          <div class="current-weather__main">
            <div class="current-weather__icon" data-testid="current-icon">
              {{ getWeatherIcon(weatherData.current.weather_code, weatherData.current.is_day) }}
            </div>
            <div class="current-weather__temp-group">
              <div class="current-weather__temp" data-testid="current-temperature">
                {{ formatTemperature(weatherData.current.temperature_2m) }}
              </div>
              <div 
                class="current-weather__condition {{ getConditionClass(weatherData.current.weather_code) }}"
                data-testid="current-condition"
              >
                {{ getWeatherDescription(weatherData.current.weather_code) }}
              </div>
            </div>
          </div>
          
          <div class="current-weather__details">
            <div class="weather-detail">
              <div class="weather-detail__label">Feels like</div>
              <div class="weather-detail__value" data-testid="feels-like">
                {{ formatTemperature(weatherData.current.apparent_temperature) }}
              </div>
            </div>
            <div class="weather-detail">
              <div class="weather-detail__label">Humidity</div>
              <div class="weather-detail__value" data-testid="humidity">
                {{ formatPercentage(weatherData.current.relative_humidity_2m) }}
              </div>
            </div>
            <div class="weather-detail">
              <div class="weather-detail__label">Wind Speed</div>
              <div class="weather-detail__value" data-testid="wind-speed">
                {{ formatWindSpeed(weatherData.current.wind_speed_10m) }}
              </div>
            </div>
            <div class="weather-detail">
              <div class="weather-detail__label">Pressure</div>
              <div class="weather-detail__value" data-testid="pressure">
                {{ formatPressure(weatherData.current.pressure_msl) }}
              </div>
            </div>
            <div class="weather-detail">
              <div class="weather-detail__label">Cloud Cover</div>
              <div class="weather-detail__value" data-testid="cloud-cover">
                {{ formatPercentage(weatherData.current.cloud_cover) }}
              </div>
            </div>
            <div class="weather-detail">
              <div class="weather-detail__label">Wind Direction</div>
              <div class="weather-detail__value" data-testid="wind-direction">
                {{ getWindDirection(weatherData.current.wind_direction_10m) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CurrentWeatherComponent {
  @Input() weatherData: WeatherData | null = null;

  formatTemperature = WeatherUtils.formatTemperature;
  formatPercentage = WeatherUtils.formatPercentage;
  formatWindSpeed = WeatherUtils.formatWindSpeed;
  formatPressure = WeatherUtils.formatPressure;
  getWindDirection = WeatherUtils.getWindDirection;
  getWeatherDescription = WeatherUtils.getWeatherDescription;
  getWeatherIcon = WeatherUtils.getWeatherIcon;
  getConditionClass = WeatherUtils.getConditionClass;
}