import $ from 'jquery';

export class WeatherUI {
  constructor() {
    this.initializeElements();
  }

  initializeElements() {
    // Cache jQuery elements for better performance - matching vanilla structure
    this.$loading = $('[data-testid="loading"]');
    this.$error = $('[data-testid="error"]');
    this.$errorMessage = $('.error__message');
    this.$weatherContent = $('[data-testid="weather-content"]');
    this.$currentWeather = $('[data-testid="current-weather"]');
    this.$forecastList = $('[data-testid="forecast-list"]');

    // Current weather elements - matching vanilla structure
    this.$currentLocation = $('[data-testid="current-location"]');
    this.$currentIcon = $('[data-testid="current-icon"]');
    this.$currentTemperature = $('[data-testid="current-temperature"]');
    this.$currentCondition = $('[data-testid="current-condition"]');
    this.$feelsLike = $('[data-testid="feels-like"]');
    this.$humidity = $('[data-testid="humidity"]');
    this.$windSpeed = $('[data-testid="wind-speed"]');
    this.$pressure = $('[data-testid="pressure"]');
    this.$cloudCover = $('[data-testid="cloud-cover"]');
    this.$windDirection = $('[data-testid="wind-direction"]');
  }

  // jQuery-focused state management methods
  showLoading() {
    this.$loading.removeAttr('hidden').fadeIn(300);
    this.hideError();
    this.hideWeatherContent();
  }

  hideLoading() {
    this.$loading.fadeOut(300, () => {
      this.$loading.attr('hidden', true);
    });
  }

  showError(message) {
    this.$errorMessage.text(message);
    this.hideLoading();
    this.hideWeatherContent();
    this.$error.removeAttr('hidden').fadeIn(300);
  }

  hideError() {
    this.$error.fadeOut(300, () => {
      this.$error.attr('hidden', true);
    });
  }

  hideWeatherContent() {
    this.$weatherContent.fadeOut(300, () => {
      this.$weatherContent.attr('hidden', true);
    });
  }

  showWeatherContent(weatherData) {
    // Update current weather using jQuery
    this.updateCurrentWeather(weatherData);

    // Update forecast using jQuery
    this.updateForecast(weatherData);

    // Show weather content with fade effect
    this.hideLoading();
    this.hideError();
    this.$weatherContent.removeAttr('hidden').fadeIn(300);
  }

  updateCurrentWeather(data) {
    const location = data.location;
    const current = data.current;

    // Using jQuery text/html methods to update content
    this.$currentLocation.text(`${location.name}${location.country ? `, ${location.country}` : ''}`);

    const weatherInfo = this.getWeatherInfo(current.weather_code);
    this.$currentIcon.text(weatherInfo.icon);
    this.$currentTemperature.text(`${Math.round(current.temperature_2m)}°C`);
    this.$currentCondition.text(weatherInfo.description);

    // Update weather details using jQuery
    this.$feelsLike.text(`${Math.round(current.apparent_temperature)}°C`);
    this.$humidity.text(`${current.relative_humidity_2m}%`);
    this.$windSpeed.text(`${Math.round(current.wind_speed_10m)} km/h`);
    this.$pressure.text(`${Math.round(current.surface_pressure)} hPa`);
    this.$cloudCover.text(`${current.cloud_cover}%`);
    this.$windDirection.text(this.getWindDirection(current.wind_direction_10m));
  }

  updateForecast(data) {
    const dailyData = data.daily;

    // Clear existing forecast items using jQuery
    this.$forecastList.empty();

    // Create forecast items using jQuery DOM manipulation
    for (let i = 0; i < Math.min(dailyData.time.length, 7); i++) {
      const date = new Date(dailyData.time[i]);
      const dayName = this.getDayName(date, i);
      const weatherInfo = this.getWeatherInfo(dailyData.weather_code[i]);
      const high = Math.round(dailyData.temperature_2m_max[i]);
      const low = Math.round(dailyData.temperature_2m_min[i]);

      // Create forecast item using jQuery
      const $forecastItem = $(`
        <div class="forecast__item forecast-item" data-testid="forecast-item" tabindex="0">
          <div class="forecast__summary">
            <div class="forecast__day">${dayName}</div>
            <div class="forecast__icon forecast-item__icon">${weatherInfo.icon}</div>
            <div class="forecast__temps">
              <span class="forecast__high" data-testid="forecast-high">${high}°</span>
              <span class="forecast__low" data-testid="forecast-low">${low}°</span>
            </div>
          </div>
          <div class="forecast__details forecast-item__details">
            <div class="forecast__date">
              ${date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
            </div>
            <div class="forecast__condition">${weatherInfo.description}</div>
            <div class="forecast__detail-grid">
              <div class="forecast__detail">
                <span>High:</span> ${high}°C
              </div>
              <div class="forecast__detail">
                <span>Low:</span> ${low}°C
              </div>
            </div>
          </div>
        </div>
      `);

      // Add click handler using jQuery event binding - use self reference
      const self = this;
      $forecastItem.on('click keydown', function(e) {
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          self.toggleForecastItem($(this));
        }
      });

      // Append to forecast list
      this.$forecastList.append($forecastItem);
    }
  }

  toggleForecastItem($item) {
    // jQuery way of toggling forecast items - only one active at a time
    const $allItems = $('.forecast__item, .forecast-item');

    if ($item.hasClass('active')) {
      // Collapse current item
      $item.removeClass('active');
    } else {
      // Collapse all other items and expand current item
      $allItems.removeClass('active');
      $item.addClass('active');
    }
  }

  getDayName(date, index) {
    if (index === 0) {return 'Today';}
    if (index === 1) {return 'Tomorrow';}
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getWeatherInfo(code) {
    const weatherCodes = {
      0: { icon: '☀️', description: 'Clear sky' },
      1: { icon: '🌤️', description: 'Mainly clear' },
      2: { icon: '⛅', description: 'Partly cloudy' },
      3: { icon: '☁️', description: 'Overcast' },
      45: { icon: '🌫️', description: 'Fog' },
      48: { icon: '🌫️', description: 'Depositing rime fog' },
      51: { icon: '🌦️', description: 'Light drizzle' },
      53: { icon: '🌦️', description: 'Moderate drizzle' },
      55: { icon: '🌦️', description: 'Dense drizzle' },
      56: { icon: '🌧️', description: 'Light freezing drizzle' },
      57: { icon: '🌧️', description: 'Dense freezing drizzle' },
      61: { icon: '🌧️', description: 'Slight rain' },
      63: { icon: '🌧️', description: 'Moderate rain' },
      65: { icon: '🌧️', description: 'Heavy rain' },
      66: { icon: '🌧️', description: 'Light freezing rain' },
      67: { icon: '🌧️', description: 'Heavy freezing rain' },
      71: { icon: '🌨️', description: 'Slight snow fall' },
      73: { icon: '🌨️', description: 'Moderate snow fall' },
      75: { icon: '🌨️', description: 'Heavy snow fall' },
      77: { icon: '🌨️', description: 'Snow grains' },
      80: { icon: '🌦️', description: 'Slight rain showers' },
      81: { icon: '🌧️', description: 'Moderate rain showers' },
      82: { icon: '🌧️', description: 'Violent rain showers' },
      85: { icon: '🌨️', description: 'Slight snow showers' },
      86: { icon: '🌨️', description: 'Heavy snow showers' },
      95: { icon: '⛈️', description: 'Thunderstorm' },
      96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
      99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' }
    };

    return weatherCodes[code] || { icon: '🌤️', description: 'Unknown' };
  }

  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
}
