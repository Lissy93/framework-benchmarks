/**
 * Shared test helpers and utilities
 * Common functions used across different test suites
 */

const { expect } = require('@playwright/test');

/**
 * Weather App Test Helpers
 */
class WeatherAppHelpers {
  constructor(page) {
    this.page = page;
  }

  // Navigation helpers
  async navigateToApp() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // Search helpers
  async searchForCity(cityName) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    const searchButton = this.page.locator('[data-testid="search-button"]');
    
    await searchInput.fill(cityName);
    await searchButton.click();
  }

  async waitForWeatherData() {
    await expect(this.page.locator('[data-testid="current-weather"]')).toBeVisible();
  }

  async waitForError() {
    await expect(this.page.locator('[data-testid="error"]')).toBeVisible();
  }

  // Assertion helpers
  async assertCurrentWeatherVisible() {
    await expect(this.page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="current-location"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="current-temperature"]')).toBeVisible();
  }

  async assertForecastVisible(expectedCount = 7) {
    const forecastItems = this.page.locator('.forecast-item');
    await expect(forecastItems).toHaveCount(expectedCount);
  }

  async assertLocationDisplayed(expectedLocation) {
    await expect(this.page.locator('[data-testid="current-location"]'))
      .toContainText(expectedLocation);
  }

  async assertTemperatureDisplayed() {
    const temperature = this.page.locator('[data-testid="current-temperature"]');
    await expect(temperature).toBeVisible();
    
    // Should contain a number
    const tempText = await temperature.textContent();
    expect(tempText).toMatch(/\d+/);
  }

  // Interaction helpers
  async expandForecastItem(index = 0) {
    const forecastItem = this.page.locator('.forecast-item').nth(index);
    await forecastItem.click();
    await expect(forecastItem).toHaveClass(/active/);
    return forecastItem;
  }

  async collapseForecastItem(index = 0) {
    const forecastItem = this.page.locator('.forecast-item').nth(index);
    await forecastItem.click();
    await expect(forecastItem).not.toHaveClass(/active/);
    return forecastItem;
  }

  // State helpers
  async getInputValue() {
    return await this.page.locator('[data-testid="search-input"]').inputValue();
  }

  async isLoadingVisible() {
    return await this.page.locator('[data-testid="loading"]').isVisible();
  }

  async isErrorVisible() {
    return await this.page.locator('[data-testid="error"]').isVisible();
  }

  async isWeatherContentVisible() {
    return await this.page.locator('[data-testid="weather-content"]').isVisible();
  }

  // Accessibility helpers
  async checkBasicAccessibility() {
    // Check for proper heading structure
    await expect(this.page.locator('h1')).toBeVisible();
    
    // Check form has proper labels
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    
    // Check buttons are focusable
    const searchButton = this.page.locator('[data-testid="search-button"]');
    await searchButton.focus();
    await expect(searchButton).toBeFocused();
  }

  // Mobile helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }
}

/**
 * Mock API Setup
 */
class MockAPISetup {
  constructor(page) {
    this.page = page;
  }

  async setupSuccessfulWeatherAPI() {
    await this.page.route('**/api.open-meteo.com/v1/geocoding*', async route => {
      const url = route.request().url();
      const searchTerm = new URL(url).searchParams.get('name');
      
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
    });

    await this.page.route('**/api.open-meteo.com/v1/forecast*', async route => {
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
  }

  async setupFailedGeocoding() {
    await this.page.route('**/api.open-meteo.com/v1/geocoding*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] })
      });
    });
  }

  async setupNetworkError() {
    await this.page.route('**/api.open-meteo.com/**', async route => {
      await route.abort('failed');
    });
  }

  async setupRateLimitError() {
    await this.page.route('**/api.open-meteo.com/**', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too many requests' })
      });
    });
  }
}

/**
 * Performance Utilities
 */
class PerformanceUtils {
  static async measureLoadTime(page, url) {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async measureRenderTime(page, selector) {
    const startTime = Date.now();
    await expect(page.locator(selector)).toBeVisible();
    return Date.now() - startTime;
  }
}

module.exports = {
  WeatherAppHelpers,
  MockAPISetup,
  PerformanceUtils
};