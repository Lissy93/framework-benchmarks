import { useState, useEffect, useCallback } from 'react';
import WeatherService from '../services/WeatherService';

const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherService] = useState(() => new WeatherService());

  const loadWeather = useCallback(async (city) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await weatherService.getWeatherByCity(city);
      setWeatherData(data);
      
      // Save location to localStorage
      try {
        localStorage.setItem('weather-app-location', city);
      } catch (error) {
        console.warn('Could not save location to localStorage:', error);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [weatherService]);

  const getCurrentLocationWeather = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setIsLoading(true);
            setError(null);
            
            const { latitude, longitude } = position.coords;
            const data = await weatherService.getWeatherData(latitude, longitude);
            data.locationName = 'Current Location';
            
            setWeatherData(data);
            resolve();
          } catch (error) {
            setError(error.message);
            reject(error);
          } finally {
            setIsLoading(false);
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
  }, [weatherService]);

  const loadSavedLocation = useCallback(async () => {
    // For mock mode, always load London directly
    if (weatherService.useMockData) {
      await loadWeather('London');
      return 'London';
    }

    try {
      const savedLocation = localStorage.getItem('weather-app-location');
      if (savedLocation) {
        await loadWeather(savedLocation);
        return savedLocation;
      }
    } catch (error) {
      console.warn('Could not load saved location:', error);
    }
    
    // Try to get current location
    try {
      await getCurrentLocationWeather();
      return 'Current Location';
    } catch (error) {
      console.warn('Could not get current location:', error);
      // Fallback to default location
      await loadWeather('London');
      return 'London';
    }
  }, [loadWeather, getCurrentLocationWeather, weatherService]);

  // Auto-load on mount
  useEffect(() => {
    const autoLoad = async () => {
      try {
        await loadSavedLocation();
      } catch (error) {
        console.error('Failed to auto-load weather:', error);
      }
    };
    
    autoLoad();
  }, [loadSavedLocation]);

  return {
    weatherData,
    isLoading,
    error,
    loadWeather,
    loadSavedLocation,
    getCurrentLocationWeather
  };
};

export default useWeatherData;