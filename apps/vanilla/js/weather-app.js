class WeatherApp {
  constructor() {
    this.weatherService = new WeatherService();
    this.currentWeatherData = null;
    this.activeforecastIndex = null;
    this.initializeElements();
    this.bindEvents();
    this.loadSavedLocation();
  }

  initializeElements() {
    this.searchForm = document.querySelector('[data-testid="search-form"]');
    this.searchInput = document.querySelector('[data-testid="search-input"]');
    this.searchButton = document.querySelector('[data-testid="search-button"]');

    this.loadingElement = document.querySelector('[data-testid="loading"]');
    this.errorElement = document.querySelector('[data-testid="error"]');
    this.weatherContent = document.querySelector('[data-testid="weather-content"]');

    this.currentLocation = document.querySelector('[data-testid="current-location"]');
    this.currentTemp = document.querySelector('[data-testid="current-temperature"]');
    this.currentCondition = document.querySelector('[data-testid="current-condition"]');
    this.currentIcon = document.querySelector('[data-testid="current-icon"]');
    this.feelsLike = document.querySelector('[data-testid="feels-like"]');
    this.humidity = document.querySelector('[data-testid="humidity"]');
    this.windSpeed = document.querySelector('[data-testid="wind-speed"]');
    this.pressure = document.querySelector('[data-testid="pressure"]');
    this.cloudCover = document.querySelector('[data-testid="cloud-cover"]');
    this.windDirection = document.querySelector('[data-testid="wind-direction"]');

    this.forecastList = document.querySelector('[data-testid="forecast-list"]');
  }

  bindEvents() {
    this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
  }

  async handleSearch(e) {
    e.preventDefault();
    const city = this.searchInput.value.trim();

    if (!city) {
      this.showError('Please enter a city name');
      return;
    }

    await this.loadWeather(city);
  }

  async loadWeather(city) {
    try {
      this.showLoading();
      this.currentWeatherData = await this.weatherService.getWeatherByCity(city);
      this.saveLocation(city);
      this.displayWeather();
    } catch (error) {
      this.showError(error.message);
    }
  }

  displayWeather() {
    const { current, locationName, country } = this.currentWeatherData;

    // Display current weather
    this.currentLocation.textContent = locationName + (country ? `, ${country}` : '');
    this.currentTemp.textContent = WeatherUtils.formatTemperature(current.temperature_2m);
    this.currentCondition.textContent = WeatherUtils.getWeatherDescription(current.weather_code);
    this.currentCondition.className = `current-weather__condition ${WeatherUtils.getConditionClass(current.weather_code)}`;
    this.currentIcon.textContent = WeatherUtils.getWeatherIcon(current.weather_code, current.is_day);

    // Display current weather details
    this.feelsLike.textContent = WeatherUtils.formatTemperature(current.apparent_temperature);
    this.humidity.textContent = WeatherUtils.formatPercentage(current.relative_humidity_2m);
    this.windSpeed.textContent = WeatherUtils.formatWindSpeed(current.wind_speed_10m);
    this.pressure.textContent = WeatherUtils.formatPressure(current.pressure_msl);
    this.cloudCover.textContent = WeatherUtils.formatPercentage(current.cloud_cover);
    this.windDirection.textContent = WeatherUtils.getWindDirection(current.wind_direction_10m);

    // Display forecast
    this.displayForecast();

    this.showWeatherContent();
  }

  displayForecast() {
    const { daily } = this.currentWeatherData;
    this.forecastList.innerHTML = '';
    this.activeforecastIndex = null;

    daily.time.forEach((date, index) => {
      const forecastItem = this.createForecastItem(daily, index);
      this.forecastList.appendChild(forecastItem);
    });
  }

  createForecastItem(daily, index) {
    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.setAttribute('data-testid', 'forecast-item');
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View detailed forecast for ${WeatherUtils.formatDate(daily.time[index])}`);

    const dayName = WeatherUtils.formatDate(daily.time[index]);
    const weatherCode = daily.weather_code[index];
    const high = daily.temperature_2m_max[index];
    const low = daily.temperature_2m_min[index];
    const condition = WeatherUtils.getWeatherDescription(weatherCode);
    const icon = WeatherUtils.getWeatherIcon(weatherCode);

    item.innerHTML = `
      <div class="forecast-item__day">${dayName}</div>
      <div class="forecast-item__icon">${icon}</div>
      <div class="forecast-item__info">
        <div class="forecast-item__condition">${condition}</div>
        <div class="forecast-item__temps" data-testid="forecast-temps">
          <span class="forecast-item__high" data-testid="forecast-high">${WeatherUtils.formatTemperature(high)}</span>
          <span class="forecast-item__low" data-testid="forecast-low">${WeatherUtils.formatTemperature(low)}</span>
        </div>
      </div>
    `;

    item.addEventListener('click', () => this.toggleForecastDetails(item, daily, index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleForecastDetails(item, daily, index);
      }
    });

    return item;
  }

  toggleForecastDetails(item, daily, index) {
    // If clicking the same item, collapse it
    if (this.activeforecastIndex === index) {
      this.collapseForecastDetails();
      return;
    }

    // Collapse any currently active item
    this.collapseForecastDetails();

    // Expand the clicked item
    this.expandForecastDetails(item, daily, index);
  }

  expandForecastDetails(item, daily, index) {
    const sunrise = daily.sunrise[index];
    const sunset = daily.sunset[index];
    const rainSum = daily.rain_sum[index];
    const uvIndex = daily.uv_index_max[index];
    const minTemp = daily.temperature_2m_min[index];
    const maxTemp = daily.temperature_2m_max[index];
    const precipitationProb = daily.precipitation_probability_max[index];

    const detailsHtml = `
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
        <div class="forecast-detail-item__value">${rainSum.toFixed(1)} mm</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">UV Index</div>
        <div class="forecast-detail-item__value">${uvIndex.toFixed(1)}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Precipitation</div>
        <div class="forecast-detail-item__value">${WeatherUtils.formatPercentage(precipitationProb)}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Temperature</div>
        <div class="forecast-detail-item__value">
        ${WeatherUtils.formatTemperature(minTemp)} to ${WeatherUtils.formatTemperature(maxTemp)}
        </div>
      </div>
      </div>
    `;

    item.insertAdjacentHTML('beforeend', detailsHtml);
    item.classList.add('active');
    this.activeforecastIndex = index;

    // Smooth scroll to the expanded item
    setTimeout(() => {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  collapseForecastDetails() {
    if (this.activeforecastIndex !== null) {
      const activeItem = this.forecastList.children[this.activeforecastIndex];
      if (activeItem) {
        const details = activeItem.querySelector('.forecast-item__details');
        if (details) {
          details.remove();
        }
        activeItem.classList.remove('active');
      }
      this.activeforecastIndex = null;
    }
  }


  showLoading() {
    WeatherUtils.hideElement(this.errorElement);
    WeatherUtils.hideElement(this.weatherContent);
    WeatherUtils.showElement(this.loadingElement);
    this.searchButton.disabled = true;

    const buttonText = this.searchButton.querySelector('.search-button__text');
    if (buttonText) {
      buttonText.textContent = 'Loading...';
    }
  }

  showError(message) {
    WeatherUtils.hideElement(this.loadingElement);
    WeatherUtils.hideElement(this.weatherContent);

    const errorMessage = this.errorElement.querySelector('.error__message');
    if (errorMessage) {
      errorMessage.textContent = message;
    }

    WeatherUtils.showElement(this.errorElement);
    this.searchButton.disabled = false;

    const buttonText = this.searchButton.querySelector('.search-button__text');
    if (buttonText) {
      buttonText.textContent = 'Get Weather';
    }
  }

  showWeatherContent() {
    WeatherUtils.hideElement(this.loadingElement);
    WeatherUtils.hideElement(this.errorElement);
    WeatherUtils.showElement(this.weatherContent);
    this.searchButton.disabled = false;

    const buttonText = this.searchButton.querySelector('.search-button__text');
    if (buttonText) {
      buttonText.textContent = 'Get Weather';
    }
  }

  saveLocation(city) {
    try {
      localStorage.setItem('weather-app-location', city);
    } catch (error) {
      console.warn('Could not save location to localStorage:', error);
    }
  }

  async loadSavedLocation() {
    try {
      const savedLocation = localStorage.getItem('weather-app-location');
      if (savedLocation) {
        this.searchInput.value = savedLocation;
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
      this.searchInput.value = 'London';
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
            const { latitude, longitude } = position.coords;
            this.currentWeatherData = await this.weatherService.getWeatherData(latitude, longitude);
            this.currentWeatherData.locationName = 'Current Location';
            this.searchInput.value = 'Current Location';
            this.displayWeather();
            resolve();
          } catch (error) {
            reject(error);
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});
