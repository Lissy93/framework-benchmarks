import { component$ } from '@builder.io/qwik';
import type { WeatherData } from '../services/WeatherService';
import { CurrentWeather } from './CurrentWeather';
import { Forecast } from './Forecast';

interface WeatherContentProps {
  weatherData: WeatherData;
}

export const WeatherContent = component$<WeatherContentProps>(({ weatherData }) => {
  return (
    <div class="weather-content" data-testid="weather-content">
      <div class="weather-layout">
        <CurrentWeather weatherData={weatherData} />
        <Forecast weatherData={weatherData} />
      </div>
    </div>
  );
});
