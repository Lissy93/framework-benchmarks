import { Show } from 'solid-js';
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';

function WeatherContent(props) {
  return (
    <Show when={props.isVisible}>
      <div class="weather-content" data-testid="weather-content">
        <div class="weather-layout">
          <CurrentWeather weatherData={props.weatherData} />
          <Forecast weatherData={props.weatherData} />
        </div>
      </div>
    </Show>
  );
}

export default WeatherContent;
