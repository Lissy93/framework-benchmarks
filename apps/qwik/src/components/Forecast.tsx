import { component$, useSignal, $ } from '@builder.io/qwik';
import type { WeatherData } from '../services/WeatherService';
import { ForecastItem } from './ForecastItem';

interface ForecastProps {
  weatherData: WeatherData;
}

export const Forecast = component$<ForecastProps>(({ weatherData }) => {
  const activeForecastIndex = useSignal<number | null>(null);

  const toggleForecastDetails = $((index: number) => {
    if (activeForecastIndex.value === index) {
      activeForecastIndex.value = null;
    } else {
      activeForecastIndex.value = index;
    }
  });

  return (
    <section class="forecast-section">
      <h2 class="section-title">7-Day Forecast</h2>
      <div class="forecast">
        <div class="forecast__list" data-testid="forecast-list">
          {weatherData.daily.time.map((_, index) => (
            <ForecastItem
              key={index}
              daily={weatherData.daily}
              index={index}
              isActive={activeForecastIndex.value === index}
              onToggle={toggleForecastDetails}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
