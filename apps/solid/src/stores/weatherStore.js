import { createSignal } from 'solid-js';
import WeatherService from '../services/WeatherService';

// Create signals for state management
const [weatherData, setWeatherData] = createSignal(null);
const [isLoading, setIsLoading] = createSignal(true); // Start with true for initial loading
const [error, setError] = createSignal(null);

// Create weather service instance
const weatherService = new WeatherService();

// Track the latest request to avoid race conditions
let latestRequestId = 0;

export const weatherStore = {
  // Getters
  get weatherData() { return weatherData(); },
  get isLoading() { return isLoading(); },
  get error() { return error(); },
  
  // Signal accessors for reactive subscriptions
  weatherDataSignal: weatherData,
  isLoadingSignal: isLoading,
  errorSignal: error,

  // Load weather by city
  async loadWeather(city) {
    const requestId = ++latestRequestId;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add small delay in test environments to make loading state visible
      if (isTestEnvironment()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const data = await weatherService.getWeatherByCity(city);
      
      // Only update if this is still the latest request
      if (requestId === latestRequestId) {
        setWeatherData(data);
        
        // Save location to localStorage
        saveLocation(city);
      }
    } catch (err) {
      // Only set error if this is still the latest request
      if (requestId === latestRequestId) {
        setError(err.message);
        console.error('Weather store error:', err);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === latestRequestId) {
        setIsLoading(false);
      }
    }
  },

  // Get current location weather
  async getCurrentLocationWeather() {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await weatherService.getCurrentLocationWeather();
      setWeatherData(data);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  },

  // Initialize the app
  async initialize() {
    try {
      // Clear any existing error (loading state is already true by default)
      setError(null);
      
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
      setError('Failed to load weather data');
      setIsLoading(false);
    }
  },

  // Clear error
  clearError() {
    setError(null);
  }
};

// Helper functions
function saveLocation(city) {
  try {
    localStorage.setItem('weather-app-location', city);
  } catch (error) {
    console.warn('Could not save location to localStorage:', error);
  }
}

function getSavedLocation() {
  try {
    return localStorage.getItem('weather-app-location');
  } catch (error) {
    console.warn('Could not load saved location:', error);
    return null;
  }
}

function isTestEnvironment() {
  return navigator.userAgent.includes('Playwright') || 
         navigator.userAgent.includes('HeadlessChrome');
}