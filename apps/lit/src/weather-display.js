import { LitElement, html, css } from 'lit';
import { WeatherUtils } from './weather-utils.js';
import { designSystemStyles, baseStyles, componentStyles } from './shared-styles.js';
import './weather-forecast.js';

export class WeatherDisplay extends LitElement {
  // eslint-disable-next-line
  static styles = [
    designSystemStyles,
    baseStyles,
    componentStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  // eslint-disable-next-line
  static properties = {
    weatherData: { type: Object },
    isLoading: { type: Boolean },
    hasError: { type: Boolean },
    errorMessage: { type: String }
  };

  constructor() {
    super();
    this.weatherData = null;
    this.isLoading = false;
    this.hasError = false;
    this.errorMessage = '';
  }

  render() {
    if (this.isLoading) {
      return this._renderLoading();
    }

    if (this.hasError) {
      return this._renderError();
    }

    if (this.weatherData) {
      return this._renderWeatherContent();
    }

    return html``;
  }

  _renderLoading() {
    return html`
      <div class="loading" data-testid="loading">
        <div class="loading__spinner"></div>
        <p>Loading weather data...</p>
      </div>
    `;
  }

  _renderError() {
    return html`
      <div class="error" data-testid="error">
        <h2 class="error__title">Unable to load weather data</h2>
        <p class="error__message">${this.errorMessage || 'Please check the city name and try again.'}</p>
      </div>
    `;
  }

  _renderWeatherContent() {
    const { current, locationName, country } = this.weatherData;
    
    return html`
      <div class="weather-content" data-testid="weather-content">
        <div class="weather-layout">
          <!-- Current Weather -->
          <section class="current-section">
            <h2 class="section-title">Current Weather</h2>
            <div class="weather-card" data-testid="current-weather">
              <div class="current-weather">
                <h3 class="current-weather__location" data-testid="current-location">
                  ${locationName}${country ? `, ${country}` : ''}
                </h3>
                <div class="current-weather__main">
                  <div class="current-weather__icon" data-testid="current-icon">
                    ${WeatherUtils.getWeatherIcon(current.weather_code, current.is_day)}
                  </div>
                  <div class="current-weather__temp-group">
                    <div class="current-weather__temp" data-testid="current-temperature">
                      ${WeatherUtils.formatTemperature(current.temperature_2m)}
                    </div>
                    <div 
                      class="current-weather__condition ${WeatherUtils.getConditionClass(current.weather_code)}" 
                      data-testid="current-condition"
                    >
                      ${WeatherUtils.getWeatherDescription(current.weather_code)}
                    </div>
                  </div>
                </div>
                
                <div class="current-weather__details">
                  <div class="weather-detail">
                    <div class="weather-detail__label">Feels like</div>
                    <div class="weather-detail__value" data-testid="feels-like">
                      ${WeatherUtils.formatTemperature(current.apparent_temperature)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Humidity</div>
                    <div class="weather-detail__value" data-testid="humidity">
                      ${WeatherUtils.formatPercentage(current.relative_humidity_2m)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Wind Speed</div>
                    <div class="weather-detail__value" data-testid="wind-speed">
                      ${WeatherUtils.formatWindSpeed(current.wind_speed_10m)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Pressure</div>
                    <div class="weather-detail__value" data-testid="pressure">
                      ${WeatherUtils.formatPressure(current.pressure_msl)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Cloud Cover</div>
                    <div class="weather-detail__value" data-testid="cloud-cover">
                      ${WeatherUtils.formatPercentage(current.cloud_cover)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Wind Direction</div>
                    <div class="weather-detail__value" data-testid="wind-direction">
                      ${WeatherUtils.getWindDirection(current.wind_direction_10m)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Forecast -->
          <weather-forecast .forecastData=${this.weatherData}></weather-forecast>
        </div>
      </div>
    `;
  }
}

customElements.define('weather-display', WeatherDisplay);