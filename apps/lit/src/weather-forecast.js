import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { designSystemStyles, baseStyles, componentStyles } from './shared-styles.js';
import './forecast-item.js';

export class WeatherForecast extends LitElement {
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
    _activeForecastIndex: { state: true }
  };

  constructor() {
    super();
    this.forecastData = null;
    this._activeForecastIndex = null;
  }

  render() {
    if (!this.forecastData?.daily?.time) {
      return html``;
    }

    const { daily } = this.forecastData;

    return html`
      <section class="forecast-section">
        <h2 class="section-title">7-Day Forecast</h2>
        <div class="forecast">
          <div class="forecast__list" data-testid="forecast-list">
            ${repeat(
              daily.time,
              (time, index) => index,
              (time, index) => html`
                <forecast-item
                  .forecastData=${daily}
                  .index=${index}
                  ?active=${this._activeForecastIndex === index}
                  @toggle-forecast=${this._handleToggleForecast}
                ></forecast-item>
              `
            )}
          </div>
        </div>
      </section>
    `;
  }

  _handleToggleForecast(e) {
    const { index } = e.detail;
    
    // If clicking the same item, collapse it
    if (this._activeForecastIndex === index) {
      this._activeForecastIndex = null;
      return;
    }

    // Set the new active index
    this._activeForecastIndex = index;
  }
}

customElements.define('weather-forecast', WeatherForecast);