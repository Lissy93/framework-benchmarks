import useWeatherData from './hooks/useWeatherData';
import SearchForm from './components/SearchForm';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import WeatherContent from './components/WeatherContent';

function App() {
  const { weatherData, isLoading, error, loadWeather } = useWeatherData();

  const handleSearch = async (city) => {
    await loadWeather(city);
  };

  // Update search input when weather data changes
  const currentLocationName = weatherData?.locationName;

  return (
    <>
      <header class="header">
        <div class="container">
          <h1 class="header__title">Weather Front</h1>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <SearchForm 
            isLoading={isLoading}
            currentLocation={currentLocationName}
            onSearch={handleSearch}
          />

          <div class="weather-container" data-testid="weather-container">
            <LoadingState isVisible={isLoading} />
            
            <ErrorState 
              isVisible={!!error && !isLoading} 
              message={error}
            />
            
            <WeatherContent 
              isVisible={!!weatherData && !isLoading && !error}
              weatherData={weatherData}
            />
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p class="footer__text">
            Built with Preact • MIT License • 
            <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">
              Alicia Sykes
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;