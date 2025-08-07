import WeatherUtils from '../utils/WeatherUtils';

const CurrentWeather = ({ weatherData }) => {
  if (!weatherData) return null;

  const current = weatherData.current;
  const location = `${weatherData.locationName}${weatherData.country ? `, ${weatherData.country}` : ''}`;
  const icon = WeatherUtils.getWeatherIcon(current.weather_code, current.is_day);
  const condition = WeatherUtils.getWeatherDescription(current.weather_code);
  const conditionClass = WeatherUtils.getConditionClass(current.weather_code);

  return (
    <div>
      <h2 class="section-title">Current Weather</h2>
      <section class={`current-weather weather-card ${conditionClass}`} data-testid="current-weather">
        <div class="current-weather__header">
          <h3 class="current-weather__location" data-testid="current-location">
            {location}
          </h3>
        </div>
        
        <div class="current-weather__main">
          <div class="current-weather__temp" data-testid="current-temp">
            <span data-testid="current-temperature">{WeatherUtils.formatTemperature(current.temperature_2m)}</span>
          </div>
          <div class="current-weather__icon" data-testid="weather-icon">
            <span data-testid="current-icon">{icon}</span>
          </div>
        </div>
        
        <div class="current-weather__condition" data-testid="weather-condition">
          {condition}
        </div>
        
        <div class="current-weather__details">
          <div class="weather-detail">
            <span class="weather-detail__label">Feels like</span>
            <span class="weather-detail__value" data-testid="feels-like">
              {WeatherUtils.formatTemperature(current.apparent_temperature)}
            </span>
          </div>
          
          <div class="weather-detail">
            <span class="weather-detail__label">Humidity</span>
            <span class="weather-detail__value" data-testid="humidity">
              {WeatherUtils.formatPercentage(current.relative_humidity_2m)}
            </span>
          </div>
          
          <div class="weather-detail">
            <span class="weather-detail__label">Wind</span>
            <span class="weather-detail__value" data-testid="wind">
              <span data-testid="wind-speed">{WeatherUtils.formatWindSpeed(current.wind_speed_10m)}</span> {WeatherUtils.getWindDirection(current.wind_direction_10m)}
            </span>
          </div>
          
          <div class="weather-detail">
            <span class="weather-detail__label">Pressure</span>
            <span class="weather-detail__value" data-testid="pressure">
              {WeatherUtils.formatPressure(current.pressure_msl)}
            </span>
          </div>
          
          <div class="weather-detail">
            <span class="weather-detail__label">Cloud Cover</span>
            <span class="weather-detail__value" data-testid="cloud-cover">
              {WeatherUtils.formatPercentage(current.cloud_cover)}
            </span>
          </div>
          
          <div class="weather-detail">
            <span class="weather-detail__label">Precipitation</span>
            <span class="weather-detail__value" data-testid="precipitation">
              {current.precipitation?.toFixed(1)} mm
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CurrentWeather;
