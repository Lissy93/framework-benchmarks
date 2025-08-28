import { component$, useSignal, $, useVisibleTask$ } from '@builder.io/qwik';
import { SearchForm } from './components/SearchForm';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { WeatherContent } from './components/WeatherContent';
import { getWeatherByCity, type WeatherData } from './services/WeatherService';

export const App = component$(() => {
  const weatherData = useSignal<WeatherData | null>(null);
  const isLoading = useSignal(false);
  const error = useSignal<string | null>(null);
  const searchValue = useSignal('London');

  const searchWeather = $(async(city: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await getWeatherByCity(city);
      weatherData.value = data;
      searchValue.value = city;

      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('weather-app-location', city);
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch weather data';
      weatherData.value = null;
    } finally {
      isLoading.value = false;
    }
  });

  // Load initial weather data
  useVisibleTask$(async() => {
    let initialCity = 'London';

    // Try to get saved location from localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        const savedLocation = localStorage.getItem('weather-app-location');
        if (savedLocation) {
          initialCity = savedLocation;
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    // Load initial data without setting loading state
    isLoading.value = true;
    error.value = null;
    try {
      const data = await getWeatherByCity(initialCity);
      weatherData.value = data;
      searchValue.value = initialCity;

      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('weather-app-location', initialCity);
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch weather data';
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <>
      <SearchForm
        onSearch={searchWeather}
        isLoading={isLoading.value}
        currentValue={searchValue.value}
      />

      <div class="weather-container" data-testid="weather-container">
        {isLoading.value && <LoadingState />}

        {error.value && !isLoading.value && (
          <ErrorState message={error.value} />
        )}

        {weatherData.value && !isLoading.value && !error.value && (
          <WeatherContent weatherData={weatherData.value} />
        )}
      </div>
    </>
  );
});
