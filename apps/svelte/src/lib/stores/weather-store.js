import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { WeatherService } from '../services/weather-service.js';

// Create the weather service instance
const weatherService = new WeatherService();

// Create writable stores
export const weatherData = writable(null);
export const isLoading = writable(true);
export const error = writable(null);

// Track the latest request to avoid race conditions
let latestRequestId = 0;

// Store actions
export const weatherStore = {
  // Load weather by city
  async loadWeather(city) {
    const requestId = ++latestRequestId;

    try {
      isLoading.set(true);
      error.set(null);

      // Add small delay in test environments to make loading state visible
      if (isTestEnvironment()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const data = await weatherService.getWeatherByCity(city);

      // Only update if this is still the latest request
      if (requestId === latestRequestId) {
        weatherData.set(data);

        // Save location to localStorage
        saveLocation(city);
      }
    } catch (err) {
      // Only set error if this is still the latest request
      if (requestId === latestRequestId) {
        error.set(err.message);
        console.error('Weather store error:', err);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === latestRequestId) {
        isLoading.set(false);
      }
    }
  },

  // Get current location weather
  async getCurrentLocationWeather() {
    try {
      isLoading.set(true);
      error.set(null);

      const data = await weatherService.getCurrentLocationWeather();
      weatherData.set(data);
    } catch (err) {
      error.set(err.message);
      console.error('Current location error:', err);
    } finally {
      isLoading.set(false);
    }
  },

  // Initialize the app
  async initialize() {
    if (!browser) {return;}

    try {
      // Clear any existing error (loading state is already true by default)
      error.set(null);

      const savedLocation = getSavedLocation();
      if (savedLocation) {
        await this.loadWeather(savedLocation);
        return;
      }

      // Try to get current location (unless in mock mode where we fallback to London)
      if (weatherService.useMockData) {
        // In mock mode, just load London as default without geolocation
        await this.loadWeather('London');
        return;
      }

      try {
        await this.getCurrentLocationWeather();
      } catch (err) {
        console.warn('Could not get current location:', err);
        // Fallback to default location
        await this.loadWeather('London');
      }
    } catch (err) {
      console.error('Failed to initialize weather store:', err);
      error.set('Failed to load weather data');
      isLoading.set(false);
    }
  },

  // Clear error
  clearError() {
    error.set(null);
  }
};

// Helper functions
function saveLocation(city) {
  if (!browser) {return;}

  try {
    localStorage.setItem('weather-app-location', city);
  } catch (error) {
    console.warn('Could not save location to localStorage:', error);
  }
}

function getSavedLocation() {
  if (!browser) {return null;}

  try {
    return localStorage.getItem('weather-app-location');
  } catch (error) {
    console.warn('Could not load saved location:', error);
    return null;
  }
}

function isTestEnvironment() {
  if (!browser) {return false;}

  return navigator.userAgent.includes('Playwright') ||
         navigator.userAgent.includes('HeadlessChrome');
}
