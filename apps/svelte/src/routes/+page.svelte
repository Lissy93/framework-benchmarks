<script>
  import { weatherData, isLoading, error, weatherStore } from '$lib/stores/weather-store.js';
  import SearchForm from '$lib/components/SearchForm.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import ErrorState from '$lib/components/ErrorState.svelte';
  import WeatherContent from '$lib/components/WeatherContent.svelte';

  async function handleSearch(event) {
    const city = event.detail;
    await weatherStore.loadWeather(city);
  }
</script>

<svelte:head>
  <title>Weather App - Svelte</title>
</svelte:head>

<header class="header">
  <div class="container">
    <h1 class="header__title">Weather Front</h1>
  </div>
</header>

<main class="main">
  <div class="container">
    <SearchForm 
      isLoading={$isLoading}
      on:search={handleSearch}
    />

    <div class="weather-container" data-testid="weather-container">
      <LoadingState isVisible={$isLoading} />
      
      <ErrorState 
        isVisible={!!$error && !$isLoading} 
        message={$error}
      />
      
      <WeatherContent 
        isVisible={!!$weatherData && !$isLoading && !$error}
        weatherData={$weatherData}
      />
    </div>
  </div>
</main>

<footer class="footer">
  <div class="container">
    <p class="footer__text">
      Built with Svelte • MIT License • 
      <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">
        Alicia Sykes
      </a>
    </p>
  </div>
</footer>