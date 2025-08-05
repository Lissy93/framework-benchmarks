import { c as create_ssr_component, b as createEventDispatcher, d as add_attribute, e as escape, f as each, v as validate_component, a as subscribe } from "../../chunks/ssr.js";
import { i as isLoading, e as error, w as weatherData } from "../../chunks/weather-store.js";
const SearchForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isLoading: isLoading2 = false } = $$props;
  createEventDispatcher();
  let inputElement;
  let inputValue = "";
  if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading2 !== void 0) $$bindings.isLoading(isLoading2);
  return `<section class="search-section"><form class="search-form" data-testid="search-form"><div class="search-form__group"><label for="location-input" class="sr-only" data-svelte-h="svelte-e7xf69">Enter city name</label> <input type="text" id="location-input" class="search-input" placeholder="Enter city name..." data-testid="search-input" autocomplete="off"${add_attribute("this", inputElement, 0)}${add_attribute("value", inputValue, 0)}> <button type="submit" class="search-button" data-testid="search-button" ${isLoading2 ? "disabled" : ""}><span class="search-button__text">${escape(isLoading2 ? "Loading..." : "Get Weather")}</span> <span class="search-button__icon" data-svelte-h="svelte-10aspg8">🌦️</span></button></div></form></section>`;
});
const LoadingState = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isVisible = false } = $$props;
  if ($$props.isVisible === void 0 && $$bindings.isVisible && isVisible !== void 0) $$bindings.isVisible(isVisible);
  return `<div class="loading" data-testid="loading" ${!isVisible ? "hidden" : ""}><div class="loading__spinner"></div> <p data-svelte-h="svelte-1ypmcd6">Loading weather data...</p></div>`;
});
const ErrorState = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isVisible = false } = $$props;
  let { message = null } = $$props;
  if ($$props.isVisible === void 0 && $$bindings.isVisible && isVisible !== void 0) $$bindings.isVisible(isVisible);
  if ($$props.message === void 0 && $$bindings.message && message !== void 0) $$bindings.message(message);
  return `<div class="error" data-testid="error" ${!isVisible ? "hidden" : ""}><h2 class="error__title" data-svelte-h="svelte-qog87z">Unable to load weather data</h2> <p class="error__message">${escape(message || "Please check the city name and try again.")}</p></div>`;
});
class WeatherUtils {
  static getWeatherDescription(weatherCode) {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    };
    return weatherCodes[weatherCode] || "Unknown";
  }
  static getWeatherIcon(weatherCode, isDay = true) {
    if (weatherCode === 0) {
      return isDay ? "☀️" : "🌙";
    } else if (weatherCode <= 3) {
      return isDay ? "⛅" : "☁️";
    } else if (weatherCode <= 48) {
      return "🌫️";
    } else if (weatherCode <= 57 || weatherCode >= 80 && weatherCode <= 82) {
      return "🌧️";
    } else if (weatherCode >= 61 && weatherCode <= 67) {
      return "🌧️";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return "❄️";
    } else if (weatherCode >= 85 && weatherCode <= 86) {
      return "🌨️";
    } else if (weatherCode >= 95) {
      return "⛈️";
    }
    return "🌤️";
  }
  static formatTemperature(temp) {
    return `${Math.round(temp)}°C`;
  }
  static formatWindSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  }
  static formatPressure(pressure) {
    return `${Math.round(pressure)} hPa`;
  }
  static formatPercentage(value) {
    return `${Math.round(value)}%`;
  }
  static getWindDirection(degrees) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
  static formatDate(dateString) {
    const date = new Date(dateString);
    const today = /* @__PURE__ */ new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    }
  }
  static formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }
  static getConditionClass(weatherCode) {
    if (weatherCode === 0) {
      return "weather-condition-sunny";
    } else if (weatherCode <= 3) {
      return "weather-condition-cloudy";
    } else if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) {
      return "weather-condition-rainy";
    } else if (weatherCode >= 95) {
      return "weather-condition-stormy";
    }
    return "weather-condition-cloudy";
  }
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
const CurrentWeather = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { weatherData: weatherData2 = null } = $$props;
  if ($$props.weatherData === void 0 && $$bindings.weatherData && weatherData2 !== void 0) $$bindings.weatherData(weatherData2);
  return `${weatherData2 ? `<section class="current-section"><h2 class="section-title" data-svelte-h="svelte-1w5tbw2">Current Weather</h2> <div class="weather-card" data-testid="current-weather"><div class="current-weather"><h3 class="current-weather__location" data-testid="current-location">${escape(weatherData2.locationName)}${escape(weatherData2.country ? `, ${weatherData2.country}` : "")}</h3> <div class="current-weather__main"><div class="current-weather__icon" data-testid="current-icon">${escape(WeatherUtils.getWeatherIcon(weatherData2.current.weather_code, weatherData2.current.is_day))}</div> <div class="current-weather__temp-group"><div class="current-weather__temp" data-testid="current-temperature">${escape(WeatherUtils.formatTemperature(weatherData2.current.temperature_2m))}</div> <div class="${"current-weather__condition " + escape(WeatherUtils.getConditionClass(weatherData2.current.weather_code), true)}" data-testid="current-condition">${escape(WeatherUtils.getWeatherDescription(weatherData2.current.weather_code))}</div></div></div> <div class="current-weather__details"><div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-1tungz3">Feels like</div> <div class="weather-detail__value" data-testid="feels-like">${escape(WeatherUtils.formatTemperature(weatherData2.current.apparent_temperature))}</div></div> <div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-1vek9og">Humidity</div> <div class="weather-detail__value" data-testid="humidity">${escape(WeatherUtils.formatPercentage(weatherData2.current.relative_humidity_2m))}</div></div> <div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-1b11qyo">Wind Speed</div> <div class="weather-detail__value" data-testid="wind-speed">${escape(WeatherUtils.formatWindSpeed(weatherData2.current.wind_speed_10m))}</div></div> <div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-1se0xd6">Pressure</div> <div class="weather-detail__value" data-testid="pressure">${escape(WeatherUtils.formatPressure(weatherData2.current.pressure_msl))}</div></div> <div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-104t2tz">Cloud Cover</div> <div class="weather-detail__value" data-testid="cloud-cover">${escape(WeatherUtils.formatPercentage(weatherData2.current.cloud_cover))}</div></div> <div class="weather-detail"><div class="weather-detail__label" data-svelte-h="svelte-w1fjba">Wind Direction</div> <div class="weather-detail__value" data-testid="wind-direction">${escape(WeatherUtils.getWindDirection(weatherData2.current.wind_direction_10m))}</div></div></div></div></div></section>` : ``}`;
});
const ForecastItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let dayName;
  let weatherCode;
  let high;
  let low;
  let condition;
  let icon;
  let { daily } = $$props;
  let { index } = $$props;
  let { isActive = false } = $$props;
  createEventDispatcher();
  if ($$props.daily === void 0 && $$bindings.daily && daily !== void 0) $$bindings.daily(daily);
  if ($$props.index === void 0 && $$bindings.index && index !== void 0) $$bindings.index(index);
  if ($$props.isActive === void 0 && $$bindings.isActive && isActive !== void 0) $$bindings.isActive(isActive);
  dayName = WeatherUtils.formatDate(daily.time[index]);
  weatherCode = daily.weather_code[index];
  high = daily.temperature_2m_max[index];
  low = daily.temperature_2m_min[index];
  condition = WeatherUtils.getWeatherDescription(weatherCode);
  icon = WeatherUtils.getWeatherIcon(weatherCode);
  return `<div class="${["forecast-item", isActive ? "active" : ""].join(" ").trim()}" data-testid="forecast-item" tabindex="0" role="button" aria-label="${"View detailed forecast for " + escape(dayName, true)}"><div class="forecast-item__day">${escape(dayName)}</div> <div class="forecast-item__icon">${escape(icon)}</div> <div class="forecast-item__info"><div class="forecast-item__condition">${escape(condition)}</div> <div class="forecast-item__temps" data-testid="forecast-temps"><span class="forecast-item__high" data-testid="forecast-high">${escape(WeatherUtils.formatTemperature(high))}</span> <span class="forecast-item__low" data-testid="forecast-low">${escape(WeatherUtils.formatTemperature(low))}</span></div></div> ${isActive ? `<div class="forecast-item__details"><div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-4cvx6z">Sunrise</div> <div class="forecast-detail-item__value">${escape(WeatherUtils.formatTime(daily.sunrise[index]))}</div></div> <div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-12b2w2k">Sunset</div> <div class="forecast-detail-item__value">${escape(WeatherUtils.formatTime(daily.sunset[index]))}</div></div> <div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-2z434k">Rain</div> <div class="forecast-detail-item__value">${escape(daily.rain_sum[index].toFixed(1))} mm</div></div> <div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-5st67b">UV Index</div> <div class="forecast-detail-item__value">${escape(daily.uv_index_max[index].toFixed(1))}</div></div> <div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-169861n">Precipitation</div> <div class="forecast-detail-item__value">${escape(WeatherUtils.formatPercentage(daily.precipitation_probability_max[index]))}</div></div> <div class="forecast-detail-item"><div class="forecast-detail-item__label" data-svelte-h="svelte-wc03ui">Temperature</div> <div class="forecast-detail-item__value">${escape(WeatherUtils.formatTemperature(low))} to ${escape(WeatherUtils.formatTemperature(high))}</div></div></div>` : ``}</div>`;
});
const Forecast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { weatherData: weatherData2 = null } = $$props;
  let activeForecastIndex = null;
  if ($$props.weatherData === void 0 && $$bindings.weatherData && weatherData2 !== void 0) $$bindings.weatherData(weatherData2);
  return `${weatherData2 ? `<section class="forecast-section"><h2 class="section-title" data-svelte-h="svelte-1v2fnn2">7-Day Forecast</h2> <div class="forecast"><div class="forecast__list" data-testid="forecast-list">${each(weatherData2.daily.time, (date, index) => {
    return `${validate_component(ForecastItem, "ForecastItem").$$render(
      $$result,
      {
        daily: weatherData2.daily,
        index,
        isActive: activeForecastIndex === index
      },
      {},
      {}
    )}`;
  })}</div></div></section>` : ``}`;
});
const WeatherContent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isVisible = false } = $$props;
  let { weatherData: weatherData2 = null } = $$props;
  if ($$props.isVisible === void 0 && $$bindings.isVisible && isVisible !== void 0) $$bindings.isVisible(isVisible);
  if ($$props.weatherData === void 0 && $$bindings.weatherData && weatherData2 !== void 0) $$bindings.weatherData(weatherData2);
  return `<div class="weather-content" data-testid="weather-content" ${!isVisible ? "hidden" : ""}><div class="weather-layout">${validate_component(CurrentWeather, "CurrentWeather").$$render($$result, { weatherData: weatherData2 }, {}, {})} ${validate_component(Forecast, "Forecast").$$render($$result, { weatherData: weatherData2 }, {}, {})}</div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isLoading, $$unsubscribe_isLoading;
  let $error, $$unsubscribe_error;
  let $weatherData, $$unsubscribe_weatherData;
  $$unsubscribe_isLoading = subscribe(isLoading, (value) => $isLoading = value);
  $$unsubscribe_error = subscribe(error, (value) => $error = value);
  $$unsubscribe_weatherData = subscribe(weatherData, (value) => $weatherData = value);
  $$unsubscribe_isLoading();
  $$unsubscribe_error();
  $$unsubscribe_weatherData();
  return `${$$result.head += `<!-- HEAD_svelte-5zpztk_START -->${$$result.title = `<title>Weather App - Svelte</title>`, ""}<!-- HEAD_svelte-5zpztk_END -->`, ""} <header class="header" data-svelte-h="svelte-6s12nx"><div class="container"><h1 class="header__title">Weather Front</h1></div></header> <main class="main"><div class="container">${validate_component(SearchForm, "SearchForm").$$render($$result, { isLoading: $isLoading }, {}, {})} <div class="weather-container" data-testid="weather-container">${validate_component(LoadingState, "LoadingState").$$render($$result, { isVisible: $isLoading }, {}, {})} ${validate_component(ErrorState, "ErrorState").$$render(
    $$result,
    {
      isVisible: !!$error && !$isLoading,
      message: $error
    },
    {},
    {}
  )} ${validate_component(WeatherContent, "WeatherContent").$$render(
    $$result,
    {
      isVisible: !!$weatherData && !$isLoading && !$error,
      weatherData: $weatherData
    },
    {},
    {}
  )}</div></div></main> <footer class="footer" data-svelte-h="svelte-11hcwph"><div class="container"><p class="footer__text">Built with Svelte • MIT License • 
      <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">Alicia Sykes</a></p></div></footer>`;
});
export {
  Page as default
};
