export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_direction_10m: number;
  wind_speed_10m: number;
}

export interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  sunrise: string[];
  sunset: string[];
  rain_sum: number[];
  uv_index_max: number[];
  precipitation_probability_max: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyWeather;
  locationName?: string;
  country?: string;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
}

export interface AppState {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}
