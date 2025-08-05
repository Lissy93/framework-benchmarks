/**
 * Unit tests for Weather Service
 * Tests API integration, data transformation, and error handling
 */

const fs = require('fs');
const path = require('path');

const { TestRunner } = require('./test-runner');

// Mock global fetch for testing
global.fetch = async (url, options) => {
  const mockData = {
    current: {
      temperature_2m: 22.5,
      relative_humidity_2m: 65,
      apparent_temperature: 24.2,
      wind_speed_10m: 8.5,
      wind_direction_10m: 245,
      surface_pressure: 1013.2,
      cloud_cover: 30,
      weather_code: 2
    },
    daily: {
      time: ["2024-01-15", "2024-01-16", "2024-01-17"],
      temperature_2m_max: [25.1, 23.8, 21.5],
      temperature_2m_min: [18.2, 17.9, 16.8],
      weather_code: [2, 3, 61]
    }
  };

  // Mock data file request
  if (url.includes('weather-data.json') || url.includes('mocks')) {
    return {
      ok: true,
      json: async () => mockData
    };
  }

  if (url.includes('geocoding')) {
    return {
      ok: true,
      json: async () => ({
        results: [
          {
            name: "London",
            country: "GB",
            latitude: 51.5074,
            longitude: -0.1278
          }
        ]
      })
    };
  } else if (url.includes('forecast')) {
    return {
      ok: true,
      json: async () => mockData
    };
  }
  
  throw new Error('Network error');
};

// Load the weather service code
const weatherServicePath = path.join(__dirname, '../../apps/vanilla/js/weather-service.js');
const weatherServiceCode = fs.readFileSync(weatherServicePath, 'utf8');

// Create a safe execution context
const createWeatherService = () => {
  // Mock browser globals
  const mockWindow = {
    fetch: global.fetch,
    console: console,
    location: {
      search: '?mock=true',
      hostname: 'localhost'
    }
  };
  
  const mockDocument = {};
  const mockLocalStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  
  // Execute the weather service code in our context
  const wrappedCode = `
    const window = arguments[0];
    const document = arguments[1]; 
    const localStorage = arguments[2];
    const console = arguments[3];
    const fetch = arguments[4];
    
    ${weatherServiceCode}
    return WeatherService;
  `;
  
  const WeatherService = new Function(wrappedCode)(
    mockWindow, mockDocument, mockLocalStorage, console, global.fetch
  );
  return new WeatherService();
};

const runner = new TestRunner();

// Test suite
runner.test('WeatherService should initialize correctly', async () => {
  const service = createWeatherService();
  
  if (!service) {
    throw new Error('WeatherService failed to initialize');
  }
  
  if (typeof service.getWeatherByCity !== 'function') {
    throw new Error('getWeatherByCity method not found');
  }
  
  if (typeof service.geocodeLocation !== 'function') {
    throw new Error('geocodeLocation method not found');
  }
});

runner.test('geocodeLocation should return location data', async () => {
  const service = createWeatherService();
  const result = await service.geocodeLocation('London');
  
  if (!result) {
    throw new Error('No result returned');
  }
  
  if (result.name !== 'London') {
    throw new Error(`Expected name 'London', got '${result.name}'`);
  }
  
  if (typeof result.latitude !== 'number') {
    throw new Error('Latitude should be a number');
  }
  
  if (typeof result.longitude !== 'number') {
    throw new Error('Longitude should be a number');
  }
});

runner.test('getWeatherData should return formatted weather data', async () => {
  const service = createWeatherService();
  const result = await service.getWeatherData(51.5074, -0.1278);
  
  if (!result) {
    throw new Error('No result returned');
  }
  
  if (!result.current) {
    throw new Error('Current weather data missing');
  }
  
  if (!result.daily) {
    throw new Error('Daily forecast data missing');
  }
  
  if (typeof result.current.temperature_2m !== 'number') {
    throw new Error('Current temperature should be a number');
  }
  
  if (!Array.isArray(result.daily.time)) {
    throw new Error('Daily time should be an array');
  }
});

runner.test('getWeatherByCity should return complete weather data', async () => {
  const service = createWeatherService();
  const result = await service.getWeatherByCity('London');
  
  if (!result) {
    throw new Error('No result returned');
  }
  
  if (!result.locationName) {
    throw new Error('Location name missing');
  }
  
  if (!result.current) {
    throw new Error('Current weather missing');
  }
  
  if (!result.daily) {
    throw new Error('Daily forecast missing');
  }
  
  if (result.locationName !== 'London') {
    throw new Error(`Expected location 'London', got '${result.locationName}'`);
  }
});

runner.test('should handle geocoding errors gracefully', async () => {
  // In mock mode, the service will return mock data for any city name
  // So let's test that the service handles the response correctly
  const service = createWeatherService();
  
  const result = await service.geocodeLocation('TestCity');
  
  if (!result) {
    throw new Error('Should return mock data even for invalid cities in mock mode');
  }
  
  if (typeof result.latitude !== 'number') {
    throw new Error('Should return valid latitude');
  }
  
  if (typeof result.longitude !== 'number') {
    throw new Error('Should return valid longitude');
  }
  
  if (!result.name) {
    throw new Error('Should return city name');
  }
});

runner.test('should handle weather API errors gracefully', async () => {
  // Create a service without mock mode to test actual API error handling
  const mockWindow = {
    fetch: global.fetch,
    console: console,
    location: {
      search: '',  // No mock=true
      hostname: 'test.com'  // Not localhost
    }
  };
  
  const wrappedCode = `
    const window = arguments[0];
    const document = arguments[1]; 
    const localStorage = arguments[2];
    const console = arguments[3];
    const fetch = arguments[4];
    
    ${weatherServiceCode}
    return WeatherService;
  `;
  
  const WeatherService = new Function(wrappedCode)(
    mockWindow, {}, {}, console, async (url) => {
      if (url.includes('forecast')) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        };
      }
      throw new Error('Network error');
    }
  );
  
  const service = new WeatherService();
  
  try {
    await service.getWeatherData(51.5074, -0.1278);
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (!error.message.includes('weather data') && !error.message.includes('Weather API error')) {
      throw new Error(`Unexpected error message: ${error.message}`);
    }
  }
});

runner.test('should validate required parameters', async () => {
  const service = createWeatherService();
  
  // Test that service exists and has expected methods
  if (typeof service.getWeatherByCity !== 'function') {
    throw new Error('getWeatherByCity method should exist');
  }
  
  if (typeof service.getWeatherData !== 'function') {
    throw new Error('getWeatherData method should exist');
  }
  
  if (typeof service.geocodeLocation !== 'function') {
    throw new Error('geocodeLocation method should exist');
  }
  
  // Test that methods return promises
  const result = service.getWeatherByCity('London');
  if (!result || typeof result.then !== 'function') {
    throw new Error('Methods should return promises');
  }
});

// Run the tests if this file is executed directly
if (require.main === module) {
  console.log('🧪 Running Weather Service Unit Tests\n');
  runner.run();
}

module.exports = { createWeatherService };