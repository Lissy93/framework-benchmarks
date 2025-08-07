#!/usr/bin/env node

/**
 * Generate Mock Weather Data
 * Creates realistic mock data matching Open-Meteo API structure for testing
 */

const fs = require('fs');
const path = require('path');

const MOCKS_DIR = path.join(__dirname, '..', '..', 'assets', 'mocks');
const OUTPUT_FILE = path.join(MOCKS_DIR, 'weather-data.json');

/**
 * Generate realistic weather data for 7-day forecast
 * Uses seeded random generation for consistent but varied data
 */
function generateWeatherData() {
  const today = new Date();
  const forecast = {
    dates: [],
    tempMax: [],
    tempMin: [],
    weatherCodes: [],
    sunrise: [],
    sunset: [],
    rainSum: [],
    uvIndexMax: [],
    precipitationProbMax: []
  };

  // Use seeded random for reproducible but realistic data
  let seed = 12345; // Fixed seed for consistency
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    forecast.dates.push(dateStr);
    
    // Realistic temperature ranges using seeded random
    forecast.tempMax.push(Math.round((seededRandom() * 12 + 16) * 10) / 10); // 16-28°C
    forecast.tempMin.push(Math.round((seededRandom() * 10 + 8) * 10) / 10);  // 8-18°C
    forecast.weatherCodes.push([0, 1, 2, 3, 61, 63, 80][Math.floor(seededRandom() * 7)]);
    
    // Realistic sunrise/sunset times
    const sunriseHour = 6 + Math.floor(seededRandom() * 2);
    const sunsetHour = 18 + Math.floor(seededRandom() * 3);
    forecast.sunrise.push(`${dateStr}T0${sunriseHour}:${Math.floor(seededRandom() * 60).toString().padStart(2, '0')}:00`);
    forecast.sunset.push(`${dateStr}T${sunsetHour}:${Math.floor(seededRandom() * 60).toString().padStart(2, '0')}:00`);
    
    forecast.rainSum.push(Math.round(seededRandom() * 15 * 100) / 100);
    forecast.uvIndexMax.push(Math.round((seededRandom() * 5 + 2) * 100) / 100);
    forecast.precipitationProbMax.push(Math.floor(seededRandom() * 100));
  }

  return {
    latitude: 51.5074,
    longitude: -0.1278,
    generationtime_ms: 0.23,
    utc_offset_seconds: 0,
    timezone: "GMT",
    timezone_abbreviation: "GMT",
    elevation: 38.0,
    current_units: {
      time: "iso8601",
      temperature_2m: "°C",
      relative_humidity_2m: "%",
      apparent_temperature: "°C",
      weather_code: "wmo code",
      cloud_cover: "%",
      surface_pressure: "hPa",
      wind_direction_10m: "°",
      wind_speed_10m: "km/h"
    },
    current: {
      time: new Date().toISOString().slice(0, 16),
      temperature_2m: 20.5,
      relative_humidity_2m: 68,
      apparent_temperature: 21.8,
      weather_code: 1,
      cloud_cover: 45,
      surface_pressure: 1015.3,
      wind_direction_10m: 230,
      wind_speed_10m: 12.4
    },
    daily_units: {
      time: "iso8601",
      temperature_2m_max: "°C",
      temperature_2m_min: "°C",
      weather_code: "wmo code",
      sunrise: "iso8601",
      sunset: "iso8601",
      rain_sum: "mm",
      uv_index_max: "",
      precipitation_probability_max: "%"
    },
    daily: {
      time: forecast.dates,
      temperature_2m_max: forecast.tempMax,
      temperature_2m_min: forecast.tempMin,
      weather_code: forecast.weatherCodes,
      sunrise: forecast.sunrise,
      sunset: forecast.sunset,
      rain_sum: forecast.rainSum,
      uv_index_max: forecast.uvIndexMax,
      precipitation_probability_max: forecast.precipitationProbMax
    }
  };
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔧 Generating mock weather data...');
    
    // Ensure directory exists
    fs.mkdirSync(MOCKS_DIR, { recursive: true });
    
    // Generate and write mock data
    const mockData = generateWeatherData();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockData, null, 2));
    
    // Summary
    console.log('\n✅ Mock Data Generation Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Location: ${mockData.latitude}, ${mockData.longitude}`);
    console.log(`📅 Forecast days: ${mockData.daily.time.length}`);
    console.log(`🌡️  Temperature range: ${Math.min(...mockData.daily.temperature_2m_min)}°C - ${Math.max(...mockData.daily.temperature_2m_max)}°C`);
    console.log(`📝 Output: ${path.relative(process.cwd(), OUTPUT_FILE)}`);
    console.log(`📦 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)}KB\n`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateWeatherData, main };