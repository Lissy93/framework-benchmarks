import { LitElement, html, css } from 'lit';
import { WeatherUtils } from './weather-utils.js';
import { designSystemStyles, baseStyles, componentStyles } from './shared-styles.js';

export class ForecastItem extends LitElement {
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
    forecastData: { type: Object },
    index: { type: Number },
    active: { type: Boolean, reflect: true },
    _expanded: { state: true }
  };

  constructor() {
    super();
    this.forecastData = null;
    this.index = 0;
    this.active = false;
    this._expanded = false;
  }

  render() {
    if (!this.forecastData) return html``;

    const { daily, index } = this;
    const dayName = WeatherUtils.formatDate(daily.time[index]);
    const weatherCode = daily.weather_code[index];
    const high = daily.temperature_2m_max[index];
    const low = daily.temperature_2m_min[index];
    const condition = WeatherUtils.getWeatherDescription(weatherCode);
    const icon = WeatherUtils.getWeatherIcon(weatherCode);

    return html`
      <div 
        class="forecast-item ${this.active ? 'active' : ''}"
        data-testid="forecast-item"
        tabindex="0"
        role="button"
        aria-label="View detailed forecast for ${dayName}"
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >
        <div class="forecast-item__day">${dayName}</div>
        <div class="forecast-item__icon">${icon}</div>
        <div class="forecast-item__info">
          <div class="forecast-item__condition">${condition}</div>
          <div class="forecast-item__temps" data-testid="forecast-temps">
            <span class="forecast-item__high" data-testid="forecast-high">${WeatherUtils.formatTemperature(high)}</span>
            <span class="forecast-item__low" data-testid="forecast-low">${WeatherUtils.formatTemperature(low)}</span>
          </div>
        </div>

        ${this.active ? this._renderDetails() : ''}
      </div>
    `;
  }

  _renderDetails() {
    const { daily, index } = this;
    const sunrise = daily.sunrise[index];
    const sunset = daily.sunset[index];
    const rainSum = daily.rain_sum[index];
    const uvIndex = daily.uv_index_max[index];
    const minTemp = daily.temperature_2m_min[index];
    const maxTemp = daily.temperature_2m_max[index];
    const precipitationProb = daily.precipitation_probability_max[index];

    return html`
      <div class="forecast-item__details">
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunrise</div>
          <div class="forecast-detail-item__value">${WeatherUtils.formatTime(sunrise)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunset</div>
          <div class="forecast-detail-item__value">${WeatherUtils.formatTime(sunset)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Rain</div>
          <div class="forecast-detail-item__value">${rainSum?.toFixed(1) || 0} mm</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">UV Index</div>
          <div class="forecast-detail-item__value">${uvIndex?.toFixed(1) || 0}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Precipitation</div>
          <div class="forecast-detail-item__value">${WeatherUtils.formatPercentage(precipitationProb || 0)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Temperature</div>
          <div class="forecast-detail-item__value">
            ${WeatherUtils.formatTemperature(minTemp)} to ${WeatherUtils.formatTemperature(maxTemp)}
          </div>
        </div>
      </div>
    `;
  }

  get daily() {
    return this.forecastData;
  }

  _handleClick() {
    this._dispatchToggle();
  }

  _handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._dispatchToggle();
    }
  }

  _dispatchToggle() {
    this.dispatchEvent(new CustomEvent('toggle-forecast', {
      detail: { index: this.index },
      bubbles: true,
      composed: true
    }));
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('active') && this.active) {
      // Smooth scroll to the expanded item
      setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
}

customElements.define('forecast-item', ForecastItem);