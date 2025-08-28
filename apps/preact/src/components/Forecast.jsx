import { useState } from 'preact/hooks';
import ForecastItem from './ForecastItem';

const Forecast = ({ weatherData = null }) => {
  const [activeForecastIndex, setActiveForecastIndex] = useState(null);

  const handleToggleForecast = (index) => {
    if (activeForecastIndex === index) {
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

  if (!weatherData) {
    return null;
  }

  return (
    <section class="forecast-section">
      <h2 class="section-title">7-Day Forecast</h2>
      <div class="forecast">
        <div class="forecast__list" data-testid="forecast-list">
          {weatherData.daily.time.slice(0, 7).map((date, index) => (
            <ForecastItem
              key={index}
              daily={weatherData.daily}
              index={index}
              isActive={activeForecastIndex === index}
              onToggle={handleToggleForecast}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Forecast;
