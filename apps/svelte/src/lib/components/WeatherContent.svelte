<script>
  import CurrentWeather from './CurrentWeather.svelte';
  import Forecast from './Forecast.svelte';

  export let isVisible = false;
  export let weatherData = null;
</script>

<div 
  class="weather-content" 
  data-testid="weather-content" 
  hidden={!isVisible}
>
  <div class="weather-layout">
    <CurrentWeather {weatherData} />
    <Forecast {weatherData} />
  </div>
</div>