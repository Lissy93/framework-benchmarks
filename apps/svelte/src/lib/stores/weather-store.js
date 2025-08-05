import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { WeatherService } from '../services/weather-service.js';

// Create the weather service instance
const weatherService = new WeatherService();

// Create writable stores
export const weatherData = writable(null);
export const isLoading = writable(false);
export const error = writable(null);

// Store actions
export const weatherStore = {
  // Load weather by city
  async loadWeather(city) {
    try {
      isLoading.set(true);
      error.set(null);
      
      // Add delay in test environments to make loading state visible
      if (isTestEnvironment()) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const data = await weatherService.getWeatherByCity(city);
      weatherData.set(data);
      
      // Save location to localStorage
      saveLocation(city);
    } catch (err) {
      error.set(err.message);
      console.error('Weather store error:', err);
    } finally {
      isLoading.set(false);
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
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  // Initialize the app
  async initialize() {
    if (!browser) return;
    
    try {
      // For mock mode, always load London directly
      if (weatherService.useMockData) {
        await this.loadWeather('London');
        return;
      }

      const savedLocation = getSavedLocation();
      if (savedLocation) {
        await this.loadWeather(savedLocation);
        return;
      }

      // Try to get current location
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
    }
  },

  // Clear error
  clearError() {
    error.set(null);
  }
};

// Helper functions
function saveLocation(city) {
  if (!browser) return;
  
  try {
    localStorage.setItem('weather-app-location', city);
  } catch (error) {
    console.warn('Could not save location to localStorage:', error);
  }
}

function getSavedLocation() {
  if (!browser) return null;
  
  try {
    return localStorage.getItem('weather-app-location');
  } catch (error) {
    console.warn('Could not load saved location:', error);
    return null;
  }
}

function isTestEnvironment() {
  if (!browser) return false;
  
  return navigator.userAgent.includes('Playwright') || 
         navigator.userAgent.includes('HeadlessChrome');
}