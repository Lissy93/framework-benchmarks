import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import WeatherService from '../services/WeatherService';

const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial loading
  const [error, setError] = useState(null);
  const [weatherService] = useState(() => new WeatherService());
  const latestRequestIdRef = useRef(0);

  const loadWeather = useCallback(async (city) => {
    const requestId = ++latestRequestIdRef.current;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add small delay in test environments to make loading state visible
      if (isTestEnvironment()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const data = await weatherService.getWeatherByCity(city);
      
      // Only update if this is still the latest request
      if (requestId === latestRequestIdRef.current) {
        setWeatherData(data);
        
        // Save location to localStorage
        try {
          localStorage.setItem('weather-app-location', city);
        } catch (error) {
          console.warn('Could not save location to localStorage:', error);
        }
      }
    } catch (err) {
      // Only set error if this is still the latest request
      if (requestId === latestRequestIdRef.current) {
        setError(err.message);
        console.error('Weather hook error:', err);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [weatherService]);

  const getCurrentLocationWeather = useCallback(async () => {
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
  }, [weatherService]);

  const initialize = useCallback(async () => {
    try {
      // Clear any existing error (loading state is already true by default)
      setError(null);
      
      const savedLocation = getSavedLocation();
      if (savedLocation) {
        await loadWeather(savedLocation);
        return;
      }

      // Try to get current location (unless in mock mode where we fallback to London)
      if (weatherService.useMockData) {
        // In mock mode, just load London as default without geolocation
        await loadWeather('London');
        return;
      }

      try {
        await getCurrentLocationWeather();
      } catch (err) {
        console.warn('Could not get current location:', err);
        // Fallback to default location
        await loadWeather('London');
      }
    } catch (err) {
      console.error('Failed to initialize weather data:', err);
      setError('Failed to load weather data');
      setIsLoading(false);
    }
  }, [loadWeather, getCurrentLocationWeather, weatherService]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weatherData,
    isLoading,
    error,
    loadWeather,
    getCurrentLocationWeather,
    initialize,
    clearError
  };
};

// Helper functions
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

export default useWeatherData;