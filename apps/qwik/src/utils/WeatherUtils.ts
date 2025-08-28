class WeatherUtils {
  static getWeatherIcon(weatherCode: number, isDayTime = true): string {
    const icons: { [key: number]: { day: string; night: string } } = {
      0: { day: '☀️', night: '🌙' },        // Clear sky
      1: { day: '🌤️', night: '🌙' },        // Mainly clear
      2: { day: '⛅', night: '☁️' },        // Partly cloudy
      3: { day: '☁️', night: '☁️' },        // Overcast
      45: { day: '🌫️', night: '🌫️' },      // Fog
      48: { day: '🌫️', night: '🌫️' },      // Depositing rime fog
      51: { day: '🌦️', night: '🌧️' },      // Drizzle: Light
      53: { day: '🌦️', night: '🌧️' },      // Drizzle: Moderate
      55: { day: '🌧️', night: '🌧️' },      // Drizzle: Dense intensity
      56: { day: '🌧️', night: '🌧️' },      // Freezing Drizzle: Light
      57: { day: '🌧️', night: '🌧️' },      // Freezing Drizzle: Dense intensity
      61: { day: '🌦️', night: '🌧️' },      // Rain: Slight
      63: { day: '🌧️', night: '🌧️' },      // Rain: Moderate
      65: { day: '🌧️', night: '🌧️' },      // Rain: Heavy intensity
      66: { day: '🌧️', night: '🌧️' },      // Freezing Rain: Light
      67: { day: '🌧️', night: '🌧️' },      // Freezing Rain: Heavy intensity
      71: { day: '🌨️', night: '🌨️' },      // Snow fall: Slight
      73: { day: '🌨️', night: '🌨️' },      // Snow fall: Moderate
      75: { day: '❄️', night: '❄️' },       // Snow fall: Heavy intensity
      77: { day: '🌨️', night: '🌨️' },      // Snow grains
      80: { day: '🌦️', night: '🌧️' },      // Rain showers: Slight
      81: { day: '🌧️', night: '🌧️' },      // Rain showers: Moderate
      82: { day: '🌧️', night: '🌧️' },      // Rain showers: Violent
      85: { day: '🌨️', night: '🌨️' },      // Snow showers slight
      86: { day: '❄️', night: '❄️' },       // Snow showers heavy
      95: { day: '⛈️', night: '⛈️' },       // Thunderstorm: Slight or moderate
      96: { day: '⛈️', night: '⛈️' },       // Thunderstorm with slight hail
      99: { day: '⛈️', night: '⛈️' }       // Thunderstorm with heavy hail
    };

    const iconSet = icons[weatherCode];
    if (!iconSet) {
      return isDayTime ? '☀️' : '🌙';
    }

    return isDayTime ? iconSet.day : iconSet.night;
  }

  static getWeatherDescription(weatherCode: number): string {
    const descriptions: { [key: number]: string } = {
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

    return descriptions[weatherCode] || 'Unknown weather condition';
  }

  static getConditionClass(weatherCode: number): string {
    if (weatherCode === 0) return 'clear';
    if ([1, 2].includes(weatherCode)) return 'partly-cloudy';
    if (weatherCode === 3) return 'cloudy';
    if ([45, 48].includes(weatherCode)) return 'fog';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return 'rain';
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'snow';
    if ([95, 96, 99].includes(weatherCode)) return 'thunderstorm';

    return 'default';
  }

  static formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  static formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  static formatWindSpeed(speed: number): string {
    return `${Math.round(speed)} km/h`;
  }

  static formatPressure(pressure: number): string {
    return `${Math.round(pressure)} hPa`;
  }

  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }

  static formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  static showElement(element: Element | null): void {
    if (element) {
      element.classList.remove('hidden');
    }
  }

  static hideElement(element: Element | null): void {
    if (element) {
      element.classList.add('hidden');
    }
  }
}

export default WeatherUtils;
