import { LitElement, html, css } from 'lit';
import { WeatherService } from './weather-service.js';
import { designSystemStyles, baseStyles, componentStyles } from './shared-styles.js';
import './weather-search.js';
import './weather-display.js';

export class WeatherApp extends LitElement {
  // eslint-disable-next-line
  static styles = [
    designSystemStyles,
    baseStyles,
    componentStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-family: var(--font-family-sans);
        background: var(--color-background);
        color: var(--color-text);
        line-height: var(--line-height-normal);
      }
    `
  ];

  // eslint-disable-next-line
  static properties = {
    _searchQuery: { state: true },
    _isLoading: { state: true },
    _hasError: { state: true },
    _errorMessage: { state: true },
    _weatherData: { state: true }
  };

  constructor() {
    super();
    this._searchQuery = '';
    this._isLoading = false;
    this._hasError = false;
    this._errorMessage = '';
    this._weatherData = null;
    this._weatherService = new WeatherService();
    this._loadSavedLocationOrDefault();
  }

  render() {
    return html`
      <header class="header">
        <div class="container">
          <h1 class="header__title">Weather Front</h1>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <weather-search
            .searchQuery=${this._searchQuery}
            .isLoading=${this._isLoading}
            @search-input=${this._handleSearchInput}
            @search-submit=${this._handleSearchSubmit}
            @search-error=${this._handleSearchError}
          ></weather-search>

          <div class="weather-container" data-testid="weather-container">
            <weather-display
              .weatherData=${this._weatherData}
              .isLoading=${this._isLoading}
              .hasError=${this._hasError}
              .errorMessage=${this._errorMessage}
            ></weather-display>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p class="footer__text">
            Built with Lit • MIT License • 
            <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">Alicia Sykes</a>
          </p>
        </div>
      </footer>
    `;
  }

  _handleSearchInput(e) {
    this._searchQuery = e.detail.query;
  }

  _handleSearchSubmit(e) {
    const { city } = e.detail;
    this._loadWeather(city);
  }

  _handleSearchError(e) {
    this._showError(e.detail.message);
  }

  async _loadWeather(city) {
    try {
      this._setLoading(true);
      this._clearError();
      
      this._weatherData = await this._weatherService.getWeatherByCity(city);
      this._saveLocation(city);
      this._showWeatherContent();
    } catch (error) {
      this._showError(error.message);
    } finally {
      this._setLoading(false);
    }
  }

  async _loadSavedLocationOrDefault() {
    try {
      const savedLocation = this._getSavedLocation();
      if (savedLocation) {
        this._searchQuery = savedLocation;
        await this._loadWeather(savedLocation);
        return;
      }
    } catch (error) {
      console.warn('Could not load saved location:', error);
    }

    // Try to get current location
    try {
      await this._getCurrentLocationWeather();
    } catch (error) {
      console.warn('Could not get current location:', error);
      // Fallback to default location
      this._searchQuery = 'London';
      await this._loadWeather('London');
    }
  }

  _getCurrentLocationWeather() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            this._setLoading(true);
            this._clearError();
            
            const { latitude, longitude } = position.coords;
            this._weatherData = await this._weatherService.getWeatherData(latitude, longitude);
            this._weatherData.locationName = 'Current Location';
            this._searchQuery = 'Current Location';
            
            this._showWeatherContent();
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            this._setLoading(false);
          }
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  _setLoading(loading) {
    this._isLoading = loading;
  }

  _showError(message) {
    this._hasError = true;
    this._weatherData = null;
    this._errorMessage = message;
  }

  _clearError() {
    this._hasError = false;
    this._errorMessage = '';
  }

  _showWeatherContent() {
    this._hasError = false;
  }

  _saveLocation(city) {
    try {
      localStorage.setItem('weather-app-location', city);
    } catch (error) {
      console.warn('Could not save location to localStorage:', error);
    }
  }

  _getSavedLocation() {
    try {
      return localStorage.getItem('weather-app-location');
    } catch (error) {
      console.warn('Could not get saved location from localStorage:', error);
      return null;
    }
  }
}

customElements.define('weather-app', WeatherApp);