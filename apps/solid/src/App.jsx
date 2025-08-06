import { onMount, createEffect } from 'solid-js';
import { weatherStore } from './stores/weatherStore';
import SearchForm from './components/SearchForm';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import WeatherContent from './components/WeatherContent';

function App() {
  // Initialize the weather store when the component mounts
  onMount(() => {
    weatherStore.initialize();
  });

  const handleSearch = async (city) => {
    await weatherStore.loadWeather(city);
  };

  return (
    <div>
      <header class="header">
        <div class="container">
          <h1 class="header__title">Weather Front</h1>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <SearchForm 
            isLoading={weatherStore.isLoadingSignal()}
            currentLocation={weatherStore.weatherDataSignal()?.locationName}
            onSearch={handleSearch}
          />

          <div class="weather-container" data-testid="weather-container">
            <LoadingState isVisible={weatherStore.isLoadingSignal()} />
            
            <ErrorState 
              isVisible={!!weatherStore.errorSignal() && !weatherStore.isLoadingSignal()}
              message={weatherStore.errorSignal()}
            />
            
            <WeatherContent 
              isVisible={!!weatherStore.weatherDataSignal() && !weatherStore.isLoadingSignal() && !weatherStore.errorSignal()}
              weatherData={weatherStore.weatherDataSignal()}
            />
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p class="footer__text">
            Built with Solid.js • MIT License • 
            <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">
              Alicia Sykes
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;