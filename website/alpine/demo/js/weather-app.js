// Alpine.js Weather App Component
// eslint-disable-next-line no-unused-vars
function weatherApp() {
  return {
    // Reactive data
    searchQuery: '',
    isLoading: false,
    hasError: false,
    hasData: false,
    errorMessage: 'Please check the city name and try again.',
    currentWeatherData: null,
    currentWeather: null,
    forecast: [],
    activeForecastIndex: null,

    // Services
    weatherService: new WeatherService(),

    // Lifecycle methods
    async loadSavedLocationOrDefault() {
      try {
        const savedLocation = this.getSavedLocation();
        if (savedLocation) {
          this.searchQuery = savedLocation;
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
        this.searchQuery = 'London';
        await this.loadWeather('London');
      }
    },

    // Event handlers
    async handleSearch() {
      const city = this.searchQuery.trim();

      if (!city) {
        this.showError('Please enter a city name');
        return;
      }

      await this.loadWeather(city);
    },

    // Weather data methods
    async loadWeather(city) {
      try {
        this.setLoading(true);
        this.clearError();

        this.currentWeatherData = await this.weatherService.getWeatherByCity(city);
        this.saveLocation(city);
        this.processWeatherData();
        this.showWeatherContent();
      } catch (error) {
        this.showError(error.message);
      } finally {
        this.setLoading(false);
      }
    },

    processWeatherData() {
      if (!this.currentWeatherData) {return;}

      const { current, daily, locationName, country } = this.currentWeatherData;

      // Process current weather
      this.currentWeather = {
        locationDisplay: locationName + (country ? `, ${country}` : ''),
        temperature: WeatherUtils.formatTemperature(current.temperature_2m),
        condition: WeatherUtils.getWeatherDescription(current.weather_code),
        conditionClass: `current-weather__condition ${WeatherUtils.getConditionClass(current.weather_code)}`,
        icon: WeatherUtils.getWeatherIcon(current.weather_code, current.is_day),
        feelsLike: WeatherUtils.formatTemperature(current.apparent_temperature),
        humidity: WeatherUtils.formatPercentage(current.relative_humidity_2m),
        windSpeed: WeatherUtils.formatWindSpeed(current.wind_speed_10m),
        pressure: WeatherUtils.formatPressure(current.pressure_msl),
        cloudCover: WeatherUtils.formatPercentage(current.cloud_cover),
        windDirection: WeatherUtils.getWindDirection(current.wind_direction_10m)
      };

      // Process forecast
      this.forecast = daily.time.map((date, index) => ({
        day: WeatherUtils.formatDate(date),
        icon: WeatherUtils.getWeatherIcon(daily.weather_code[index]),
        condition: WeatherUtils.getWeatherDescription(daily.weather_code[index]),
        high: WeatherUtils.formatTemperature(daily.temperature_2m_max[index]),
        low: WeatherUtils.formatTemperature(daily.temperature_2m_min[index]),
        sunrise: WeatherUtils.formatTime(daily.sunrise[index]),
        sunset: WeatherUtils.formatTime(daily.sunset[index]),
        rain: `${daily.rain_sum[index]?.toFixed(1) || 0} mm`,
        uvIndex: daily.uv_index_max[index]?.toFixed(1) || 0,
        precipitation: WeatherUtils.formatPercentage(daily.precipitation_probability_max[index] || 0),
        tempRange: `${WeatherUtils.formatTemperature(daily.temperature_2m_min[index])} to ${WeatherUtils.formatTemperature(daily.temperature_2m_max[index])}`
      }));

      this.activeForecastIndex = null;
    },

    // Forecast interaction methods
    toggleForecastDetails(index) {
      // If clicking the same item, collapse it
      if (this.activeForecastIndex === index) {
        this.activeForecastIndex = null;
        return;
      }

      // Set the new active index (Alpine will handle showing/hiding with x-show)
      this.activeForecastIndex = index;

      // Smooth scroll to the expanded item
      this.$nextTick(() => {
        const items = document.querySelectorAll('[data-testid="forecast-item"]');
        if (items[index]) {
          setTimeout(() => {
            items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      });
    },

    // State management methods
    setLoading(loading) {
      this.isLoading = loading;
    },

    showError(message) {
      this.hasError = true;
      this.hasData = false;
      this.errorMessage = message;
    },

    clearError() {
      this.hasError = false;
      this.errorMessage = 'Please check the city name and try again.';
    },

    showWeatherContent() {
      this.hasData = true;
      this.hasError = false;
    },

    // Storage methods
    saveLocation(city) {
      try {
        localStorage.setItem('weather-app-location', city);
      } catch (error) {
        console.warn('Could not save location to localStorage:', error);
      }
    },

    getSavedLocation() {
      try {
        return localStorage.getItem('weather-app-location');
      } catch (error) {
        console.warn('Could not get saved location from localStorage:', error);
        return null;
      }
    },

    // Geolocation method
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
              this.currentWeatherData = await this.weatherService.getWeatherData(latitude, longitude);
              this.currentWeatherData.locationName = 'Current Location';
              this.searchQuery = 'Current Location';

              this.processWeatherData();
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
  };
}
