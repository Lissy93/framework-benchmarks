export class WeatherUtils {
  static getWeatherDescription(weatherCode: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };

    return weatherCodes[weatherCode] || 'Unknown';
  }

  static getWeatherIcon(weatherCode: number, isDay = 1): string {
    if (weatherCode === 0) {
      return isDay ? '☀️' : '🌙';
    } else if (weatherCode <= 3) {
      return isDay ? '⛅' : '☁️';
    } else if (weatherCode <= 48) {
      return '🌫️';
    } else if (weatherCode <= 57 || (weatherCode >= 80 && weatherCode <= 82)) {
      return '🌧️';
    } else if (weatherCode >= 61 && weatherCode <= 67) {
      return '🌧️';
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return '❄️';
    } else if (weatherCode >= 85 && weatherCode <= 86) {
      return '🌨️';
    } else if (weatherCode >= 95) {
      return '⛈️';
    }
    return '🌤️';
  }

  static formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  static formatWindSpeed(speed: number): string {
    return `${Math.round(speed)} km/h`;
  }

  static formatPressure(pressure: number): string {
    return `${Math.round(pressure)} hPa`;
  }

  static formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }

  static formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  static getConditionClass(weatherCode: number): string {
    if (weatherCode === 0) {
      return 'weather-condition-sunny';
    } else if (weatherCode <= 3) {
      return 'weather-condition-cloudy';
    } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      return 'weather-condition-rainy';
    } else if (weatherCode >= 95) {
      return 'weather-condition-stormy';
    }
    return 'weather-condition-cloudy';
  }
}
