<script>
  import { tick } from 'svelte';
  import ForecastItem from './ForecastItem.svelte';

  export let weatherData = null;
  
  let activeForecastIndex = null;

  async function handleToggleForecast(event) {
    const index = event.detail;
    
    if (activeForecastIndex === index) {
      activeForecastIndex = null;
    } else {
      activeForecastIndex = index;
      
      // Smooth scroll to the expanded item
      await tick();
      setTimeout(() => {
        const activeElement = document.querySelector('.forecast-item.active');
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }
</script>

{#if weatherData}
  <section class="forecast-section">
    <h2 class="section-title">7-Day Forecast</h2>
    <div class="forecast">
      <div class="forecast__list" data-testid="forecast-list">
        {#each weatherData.daily.time as date, index}
          <ForecastItem
            daily={weatherData.daily}
            {index}
            isActive={activeForecastIndex === index}
            on:toggle={handleToggleForecast}
          />
        {/each}
      </div>
    </div>
  </section>
{/if}