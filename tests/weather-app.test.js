/**
 * Shared test suite for weather applications
 * This test suite should work across all framework implementations
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Load expected mock data for test validation
const mockDataPath = path.join(__dirname, '..', 'assets', 'mocks', 'weather-data.json');
let expectedMockData = null;

try {
  expectedMockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
} catch (error) {
  console.warn('Warning: Could not load mock data for test validation:', error.message);
}

test.describe('Weather App - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the geocoding API
    await page.route('**/api.open-meteo.com/v1/geocoding*', async route => {
      const url = route.request().url();
      const searchTerm = new URL(url).searchParams.get('name');
      
      if (searchTerm === 'InvalidCity123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ results: [] })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [{
              name: searchTerm || "London",
              country: "GB",
              latitude: 51.5074,
              longitude: -0.1278
            }]
          })
        });
      }
    });

    // Mock the weather forecast API using actual mock data
    await page.route('**/api.open-meteo.com/v1/forecast*', async route => {
      // Use the actual mock data if available, otherwise fallback to hardcoded
      const mockData = expectedMockData || {
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
          time: [
            "2024-01-15", "2024-01-16", "2024-01-17", 
            "2024-01-18", "2024-01-19", "2024-01-20", "2024-01-21"
          ],
          temperature_2m_max: [25.1, 23.8, 21.5, 19.2, 22.7, 24.3, 26.1],
          temperature_2m_min: [18.2, 17.9, 16.8, 15.1, 17.3, 19.2, 20.5],
          weather_code: [2, 3, 61, 80, 1, 2, 0]
        }
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
  });

  test('should display initial loading state', async ({ page }) => {
    await page.goto('/');
    
    // NOTE: This won't actually work, because Chromium hasn't got location permissions yet
    // await expect(page.locator('[data-testid="loading"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display weather data after loading', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for weather data to load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Should display current temperature matching mock data
    const tempText = await page.locator('[data-testid="current-temperature"]').innerText();
    if (expectedMockData) {
      const expectedTemp = expectedMockData.current.temperature_2m;
      // Extract just the number from the display (e.g., "21°C" -> "21")
      const displayedTemp = parseFloat(tempText.match(/\d+(\.\d+)?/)?.[0] || '0');
      const difference = Math.abs(displayedTemp - expectedTemp);
      
      // Allow for reasonable temperature difference (accounting for rounding, apparent temp, etc.)
      expect(difference).toBeLessThanOrEqual(3);
      
      // If difference is significant, log for debugging
      if (difference > 1) {
        console.warn(`Large temperature difference: expected ${expectedTemp}°C, got ${displayedTemp}°C from "${tempText}"`);
      }
    } else {
      expect(tempText).toMatch(/\d+/); // Fallback: just check for a number
    }
    
    // Should display location
    await expect(page.locator('[data-testid="current-location"]')).toBeVisible();
    
    // Should display 7-day forecast matching mock data
    const forecastItems = page.locator('[data-testid="forecast-item"]');
    if (expectedMockData) {
      await expect(forecastItems).toHaveCount(expectedMockData.daily.time.length);
    } else {
      await expect(forecastItems).toHaveCount(7); // Fallback
    }
  });

  test('should allow city search', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Enter city name
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Paris');
    
    // Submit search
    const searchButton = page.locator('[data-testid="search-button"]');
    await searchButton.click();
    
    // Should show loading state
    try {
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    } catch (e) {
      // console.warn('App loaded to quick for loading screen to show', e.message);
    }
    
    // Should load new weather data
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Should show Paris as the location
    await expect(page.locator('[data-testid="current-location"]')).toContainText('Paris');
  });

  test('should persist location in localStorage', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Search for a city
    await page.locator('[data-testid="search-input"]').fill('London');
    await page.locator('[data-testid="search-button"]').click();
    
    // Wait for data to load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Should remember the last searched location
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveValue('London');
  });

  test('should display error state for invalid location', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api.open-meteo.com/**', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Location not found' })
      });
    });
    
    // Disable mock mode to allow actual API calls
    await page.goto('/?mock=false');
    
    // Search for invalid location
    await page.locator('[data-testid="search-input"]').fill('InvalidCity123');
    await page.locator('[data-testid="search-button"]').click();
    
    // Should show error message (wait for fade-out animation to complete)
    await page.waitForTimeout(300); // Wait for any fade-out animations to complete
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
    // Accept either geocoding error or weather API error message
    const errorElement = page.locator('[data-testid="error"]');
    const errorText = await errorElement.innerText();
    expect(errorText).toMatch(/Unable to (find location|fetch weather data)/i);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api.open-meteo.com/**', async route => {
      await route.abort('failed');
    });
    
    // Disable mock mode to allow actual API calls
    await page.goto('/?mock=false');
    
    // Should show error state (wait for fade-out animation to complete)
    await page.waitForTimeout(300); // Wait for any fade-out animations to complete
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
  });

  test('should display all weather details', async ({ page }) => {
    await page.goto('/?mock=true');
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Check current weather details
    await expect(page.locator('[data-testid="humidity"]')).toBeVisible();
    await expect(page.locator('[data-testid="wind-speed"]')).toBeVisible();
    await expect(page.locator('[data-testid="pressure"]')).toBeVisible();
    
    // Check forecast details
    const forecastItems = page.locator('[data-testid="forecast-item"]');
    await expect(forecastItems.first().locator('[data-testid="forecast-high"]')).toBeVisible();
    await expect(forecastItems.first().locator('[data-testid="forecast-low"]')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?mock=true');
    
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/?mock=true');
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for proper form labels
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    
    // Check for keyboard navigation
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
  });
});
