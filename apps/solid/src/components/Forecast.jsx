import { createSignal, Show, For } from 'solid-js';
import ForecastItem from './ForecastItem';

function Forecast(props) {
  const [activeForecastIndex, setActiveForecastIndex] = createSignal(null);

  const handleToggleForecast = (index) => {
    if (activeForecastIndex() === index) {
      setActiveForecastIndex(null);
    } else {
      setActiveForecastIndex(index);

      // Smooth scroll to the expanded item
      setTimeout(() => {
        const activeElement = document.querySelector('.forecast-item.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  return (
    <Show when={props.weatherData}>
      <section class="forecast-section">
        <h2 class="section-title">7-Day Forecast</h2>
        <div class="forecast">
          <div class="forecast__list" data-testid="forecast-list">
            <For each={props.weatherData.daily.time.slice(0, 7)}>
              {(date, index) => (
                <ForecastItem
                  daily={props.weatherData.daily}
                  index={index()}
                  isActive={activeForecastIndex() === index()}
                  onToggle={handleToggleForecast}
                />
              )}
            </For>
          </div>
        </div>
      </section>
    </Show>
  );
}

export default Forecast;
