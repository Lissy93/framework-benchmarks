import van from 'vanjs-core';
import { WeatherService } from './weather-service.js';
import { WeatherUtils } from './weather-utils.js';

const { div, header, main, footer, h1, h2, h3, p, section, form, input, button, label, span, a } = van.tags;

// VanJS Weather App
class WeatherApp {
  constructor() {
    this.weatherService = new WeatherService();

    // Reactive state
    this.searchQuery = van.state('');
    this.isLoading = van.state(false);
    this.hasError = van.state(false);
    this.errorMessage = van.state('');
    this.weatherData = van.state(null);
    this.activeForecastIndex = van.state(null);

    this.init();
  }

  async init() {
    await this.loadSavedLocationOrDefault();
  }

  // Weather Search Component
  createSearchComponent() {
    const handleInput = (e) => {
      this.searchQuery.val = e.target.value;
    };

    const handleSubmit = async(e) => {
      e.preventDefault();
      const city = this.searchQuery.val.trim();

      if (!city) {
        this.showError('Please enter a city name');
        return;
      }

      await this.loadWeather(city);
    };

    return section(
      { class: 'search-section' },
      form(
        {
          class: 'search-form',
          'data-testid': 'search-form',
          onsubmit: handleSubmit
        },
        div(
          { class: 'search-form__group' },
          label(
            { for: 'location-input', class: 'sr-only' },
            'Enter city name'
          ),
          input({
            type: 'text',
            id: 'location-input',
            class: 'search-input',
            placeholder: 'Enter city name...',
            'data-testid': 'search-input',
            autocomplete: 'off',
            value: () => this.searchQuery.val,
            oninput: handleInput
          }),
          button(
            {
              type: 'submit',
              class: 'search-button',
              'data-testid': 'search-button',
              disabled: () => this.isLoading.val
            },
            span(
              { class: 'search-button__text' },
              () => this.isLoading.val ? 'Loading...' : 'Get Weather'
            ),
            span({ class: 'search-button__icon' }, '🌦️')
          )
        )
      )
    );
  }

  // Weather Loading Component
  createLoadingComponent() {
    return div(
      { class: 'loading', 'data-testid': 'loading' },
      div({ class: 'loading__spinner' }),
      p('Loading weather data...')
    );
  }

  // Weather Error Component
  createErrorComponent() {
    return div(
      { class: 'error', 'data-testid': 'error' },
      h2({ class: 'error__title' }, 'Unable to load weather data'),
      p(
        { class: 'error__message' },
        () => this.errorMessage.val || 'Please check the city name and try again.'
      )
    );
  }

  // Forecast Item Component
  createForecastItem(daily, index) {
    const dayName = WeatherUtils.formatDate(daily.time[index]);
    const weatherCode = daily.weather_code[index];
    const high = daily.temperature_2m_max[index];
    const low = daily.temperature_2m_min[index];
    const condition = WeatherUtils.getWeatherDescription(weatherCode);
    const icon = WeatherUtils.getWeatherIcon(weatherCode);

    const handleClick = () => {
      if (this.activeForecastIndex.val === index) {
        this.activeForecastIndex.val = null;
      } else {
        this.activeForecastIndex.val = index;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    const isActive = () => this.activeForecastIndex.val === index;

    return div(
      {
        class: () => `forecast-item ${isActive() ? 'active' : ''}`,
        'data-testid': 'forecast-item',
        tabindex: '0',
        role: 'button',
        'aria-label': `View detailed forecast for ${dayName}`,
        onclick: handleClick,
        onkeydown: handleKeyDown
      },
      div({ class: 'forecast-item__day' }, dayName),
      div({ class: 'forecast-item__icon' }, icon),
      div(
        { class: 'forecast-item__info' },
        div({ class: 'forecast-item__condition' }, condition),
        div(
          { class: 'forecast-item__temps', 'data-testid': 'forecast-temps' },
          span(
            { class: 'forecast-item__high', 'data-testid': 'forecast-high' },
            WeatherUtils.formatTemperature(high)
          ),
          span(
            { class: 'forecast-item__low', 'data-testid': 'forecast-low' },
            WeatherUtils.formatTemperature(low)
          )
        )
      ),
      () => isActive() ? this.createForecastDetails(daily, index) : ''
    );
  }

  // Forecast Details Component
  createForecastDetails(daily, index) {
    const sunrise = daily.sunrise[index];
    const sunset = daily.sunset[index];
    const rainSum = daily.rain_sum[index];
    const uvIndex = daily.uv_index_max[index];
    const minTemp = daily.temperature_2m_min[index];
    const maxTemp = daily.temperature_2m_max[index];
    const precipitationProb = daily.precipitation_probability_max[index];

    return div(
      { class: 'forecast-item__details' },
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'Sunrise'),
        div({ class: 'forecast-detail-item__value' }, WeatherUtils.formatTime(sunrise))
      ),
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'Sunset'),
        div({ class: 'forecast-detail-item__value' }, WeatherUtils.formatTime(sunset))
      ),
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'Rain'),
        div({ class: 'forecast-detail-item__value' }, `${rainSum?.toFixed(1) || 0} mm`)
      ),
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'UV Index'),
        div({ class: 'forecast-detail-item__value' }, uvIndex?.toFixed(1) || 0)
      ),
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'Precipitation'),
        div({ class: 'forecast-detail-item__value' }, WeatherUtils.formatPercentage(precipitationProb || 0))
      ),
      div(
        { class: 'forecast-detail-item' },
        div({ class: 'forecast-detail-item__label' }, 'Temperature'),
        div(
          { class: 'forecast-detail-item__value' },
          `${WeatherUtils.formatTemperature(minTemp)} to ${WeatherUtils.formatTemperature(maxTemp)}`
        )
      )
    );
  }

  // Weather Forecast Component
  createForecastComponent() {
    return () => {
      const data = this.weatherData.val;
      if (!data?.daily?.time) {return '';}

      const { daily } = data;

      return section(
        { class: 'forecast-section' },
        h2({ class: 'section-title' }, '7-Day Forecast'),
        div(
          { class: 'forecast' },
          div(
            { class: 'forecast__list', 'data-testid': 'forecast-list' },
            ...daily.time.map((_, index) => this.createForecastItem(daily, index))
          )
        )
      );
    };
  }

  // Current Weather Component
  createCurrentWeatherComponent() {
    return () => {
      const data = this.weatherData.val;
      if (!data) {return '';}

      const { current, locationName, country } = data;

      return section(
        { class: 'current-section' },
        h2({ class: 'section-title' }, 'Current Weather'),
        div(
          { class: 'weather-card', 'data-testid': 'current-weather' },
          div(
            { class: 'current-weather' },
            h3(
              { class: 'current-weather__location', 'data-testid': 'current-location' },
              `${locationName}${country ? `, ${country}` : ''}`
            ),
            div(
              { class: 'current-weather__main' },
              div(
                { class: 'current-weather__icon', 'data-testid': 'current-icon' },
                WeatherUtils.getWeatherIcon(current.weather_code, current.is_day)
              ),
              div(
                { class: 'current-weather__temp-group' },
                div(
                  { class: 'current-weather__temp', 'data-testid': 'current-temperature' },
                  WeatherUtils.formatTemperature(current.temperature_2m)
                ),
                div(
                  {
                    class: `current-weather__condition ${WeatherUtils.getConditionClass(current.weather_code)}`,
                    'data-testid': 'current-condition'
                  },
                  WeatherUtils.getWeatherDescription(current.weather_code)
                )
              )
            ),
            div(
              { class: 'current-weather__details' },
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Feels like'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'feels-like' },
                  WeatherUtils.formatTemperature(current.apparent_temperature)
                )
              ),
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Humidity'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'humidity' },
                  WeatherUtils.formatPercentage(current.relative_humidity_2m)
                )
              ),
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Wind Speed'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'wind-speed' },
                  WeatherUtils.formatWindSpeed(current.wind_speed_10m)
                )
              ),
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Pressure'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'pressure' },
                  WeatherUtils.formatPressure(current.pressure_msl)
                )
              ),
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Cloud Cover'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'cloud-cover' },
                  WeatherUtils.formatPercentage(current.cloud_cover)
                )
              ),
              div(
                { class: 'weather-detail' },
                div({ class: 'weather-detail__label' }, 'Wind Direction'),
                div(
                  { class: 'weather-detail__value', 'data-testid': 'wind-direction' },
                  WeatherUtils.getWindDirection(current.wind_direction_10m)
                )
              )
            )
          )
        )
      );
    };
  }

  // Weather Display Component
  createWeatherDisplayComponent() {
    return () => {
      if (this.isLoading.val) {
        return this.createLoadingComponent();
      }

      if (this.hasError.val) {
        return this.createErrorComponent();
      }

      if (this.weatherData.val) {
        return div(
          { class: 'weather-content', 'data-testid': 'weather-content' },
          div(
            { class: 'weather-layout' },
            this.createCurrentWeatherComponent(),
            this.createForecastComponent()
          )
        );
      }

      return '';
    };
  }

  // Main App Component
  createApp() {
    return div(
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          fontFamily: 'var(--font-family-sans)',
          background: 'var(--color-background)',
          color: 'var(--color-text)',
          lineHeight: 'var(--line-height-normal)'
        }
      },
      header(
        { class: 'header' },
        div(
          { class: 'container' },
          h1({ class: 'header__title' }, 'Weather Front')
        )
      ),
      main(
        { class: 'main' },
        div(
          { class: 'container' },
          this.createSearchComponent(),
          div(
            { class: 'weather-container', 'data-testid': 'weather-container' },
            this.createWeatherDisplayComponent()
          )
        )
      ),
      footer(
        { class: 'footer' },
        div(
          { class: 'container' },
          p(
            { class: 'footer__text' },
            'Built with VanJS • MIT License • ',
            a(
              {
                href: 'https://github.com/Lissy93',
                class: 'footer__link',
                target: '_blank',
                rel: 'noopener'
              },
              'Alicia Sykes'
            )
          )
        )
      )
    );
  }

  // Weather loading methods
  async loadWeather(city) {
    try {
      this.setLoading(true);
      this.clearError();

      this.weatherData.val = await this.weatherService.getWeatherByCity(city);
      this.saveLocation(city);
      this.showWeatherContent();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async loadSavedLocationOrDefault() {
    try {
      const savedLocation = this.getSavedLocation();
      if (savedLocation) {
        this.searchQuery.val = savedLocation;
        await this.loadWeather(savedLocation);
        return;
      }
    } catch (error) {
      console.warn('Could not load saved location:', error);
    }

    // Try to get current location
    try {
      await this.getCurrentLocationWeather();
    } catch (error) {
      console.warn('Could not get current location:', error);
      // Fallback to default location
      this.searchQuery.val = 'London';
      await this.loadWeather('London');
    }
  }

  getCurrentLocationWeather() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async(position) => {
          try {
            this.setLoading(true);
            this.clearError();

            const { latitude, longitude } = position.coords;
            this.weatherData.val = await this.weatherService.getWeatherData(latitude, longitude);
            this.weatherData.val.locationName = 'Current Location';
            this.searchQuery.val = 'Current Location';

            this.showWeatherContent();
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            this.setLoading(false);
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

  // State management methods
  setLoading(loading) {
    this.isLoading.val = loading;
  }

  showError(message) {
    this.hasError.val = true;
    this.weatherData.val = null;
    this.errorMessage.val = message;
  }

  clearError() {
    this.hasError.val = false;
    this.errorMessage.val = '';
  }

  showWeatherContent() {
    this.hasError.val = false;
  }

  saveLocation(city) {
    try {
      localStorage.setItem('weather-app-location', city);
    } catch (error) {
      console.warn('Could not save location to localStorage:', error);
    }
  }

  getSavedLocation() {
    try {
      return localStorage.getItem('weather-app-location');
    } catch (error) {
      console.warn('Could not get saved location from localStorage:', error);
      return null;
    }
  }
}

// Initialize the app
const weatherApp = new WeatherApp();
van.add(document.getElementById('app'), weatherApp.createApp());
