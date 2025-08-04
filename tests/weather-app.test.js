/**
 * Shared test suite for weather applications
 * This test suite should work across all framework implementations
 */

const { test, expect } = require('@playwright/test');

const MOCK_DATA_URL = '/assets/mocks/weather-data.json';

test.describe('Weather App', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the weather API to return our test data
    await page.route('**/api.open-meteo.com/**', async route => {
      const mockData = require('../assets/mocks/weather-data.json');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
  });

  test('should display initial loading state', async ({ page }) => {
    await page.goto('/');
    
    // Should show loading initially
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  });

  test('should display weather data after loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for weather data to load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Should display current temperature
    await expect(page.locator('[data-testid="current-temperature"]')).toContainText('22');
    
    // Should display location
    await expect(page.locator('[data-testid="current-location"]')).toBeVisible();
    
    // Should display 7-day forecast
    const forecastItems = page.locator('[data-testid="forecast-item"]');
    await expect(forecastItems).toHaveCount(7);
  });

  test('should allow city search', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Enter city name
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('Paris');
    
    // Submit search
    const searchButton = page.locator('[data-testid="search-button"]');
    await searchButton.click();
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    
    // Should load new weather data
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
  });

  test('should persist location in localStorage', async ({ page }) => {
    await page.goto('/');
    
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
    
    await page.goto('/');
    
    // Search for invalid location
    await page.locator('[data-testid="search-input"]').fill('InvalidCity123');
    await page.locator('[data-testid="search-button"]').click();
    
    // Should show error message
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error"]')).toContainText('not found');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api.open-meteo.com/**', async route => {
      await route.abort('failed');
    });
    
    await page.goto('/');
    
    // Should show error state
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
  });

  test('should display all weather details', async ({ page }) => {
    await page.goto('/');
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
    await page.goto('/');
    
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/');
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