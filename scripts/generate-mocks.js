#!/usr/bin/env node

/**
 * Script to generate mock weather data matching Open-Meteo API structure
 */

const fs = require('fs');
const path = require('path');

const MOCKS_DIR = path.join(__dirname, '..', 'assets', 'mocks');

function generateMockData() {
  console.log('Generating mock weather data matching Open-Meteo API...');

  // Generate 7 days of forecast data
  const today = new Date();
  const dates = [];
  const tempMax = [];
  const tempMin = [];
  const weatherCodes = [];
  const sunrise = [];
  const sunset = [];
  const rainSum = [];
  const uvIndexMax = [];
  const precipitationProbMax = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
    
    tempMax.push(Math.round((Math.random() * 10 + 18) * 10) / 10);
    tempMin.push(Math.round((Math.random() * 8 + 10) * 10) / 10);
    weatherCodes.push([0, 1, 2, 3, 61, 63, 80][Math.floor(Math.random() * 7)]);
    
    // Generate realistic sunrise/sunset times
    const sunriseHour = 3 + Math.floor(i * 0.1);
    const sunsetHour = 18 + Math.floor(i * 0.1);
    sunrise.push(`${date.toISOString().split('T')[0]}T0${sunriseHour}:${30 + i}0`);
    sunset.push(`${date.toISOString().split('T')[0]}T${sunsetHour}:${50 - i}0`);
    
    rainSum.push(Math.round(Math.random() * 10 * 100) / 100);
    uvIndexMax.push(Math.round((Math.random() * 3 + 3) * 100) / 100);
    precipitationProbMax.push(Math.floor(Math.random() * 100));
  }

  const mockData = {
    latitude: 52.52,
    longitude: 13.419998,
    generationtime_ms: 0.23126602172851562,
    utc_offset_seconds: 0,
    timezone: "GMT",
    timezone_abbreviation: "GMT",
    elevation: 38.0,
    current_units: {
      time: "iso8601",
      interval: "seconds",
      temperature_2m: "°C",
      relative_humidity_2m: "%",
      apparent_temperature: "°C",
      is_day: "",
      snowfall: "cm",
      showers: "mm",
      rain: "mm",
      precipitation: "mm",
      weather_code: "wmo code",
      cloud_cover: "%",
      pressure_msl: "hPa",
      surface_pressure: "hPa",
      wind_direction_10m: "°",
      wind_gusts_10m: "km/h",
      wind_speed_10m: "km/h"
    },
    current: {
      time: new Date().toISOString().slice(0, 16),
      interval: 900,
      temperature_2m: 22.0,
      relative_humidity_2m: 62,
      apparent_temperature: 21.9,
      is_day: 1,
      snowfall: 0.00,
      showers: 0.00,
      rain: 0.00,
      precipitation: 0.00,
      weather_code: 3,
      cloud_cover: 92,
      pressure_msl: 1015.5,
      surface_pressure: 1011.0,
      wind_direction_10m: 258,
      wind_gusts_10m: 27.0,
      wind_speed_10m: 10.3
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
      time: dates,
      temperature_2m_max: tempMax,
      temperature_2m_min: tempMin,
      weather_code: weatherCodes,
      sunrise: sunrise,
      sunset: sunset,
      rain_sum: rainSum,
      uv_index_max: uvIndexMax,
      precipitation_probability_max: precipitationProbMax
    }
  };

  fs.mkdirSync(MOCKS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(MOCKS_DIR, 'weather-data.json'),
    JSON.stringify(mockData, null, 2)
  );

  console.log('✓ Mock weather data generated matching Open-Meteo API structure');
}

if (require.main === module) {
  generateMockData();
}

module.exports = { generateMockData };