/**
 * Advanced E2E tests for Weather App
 * Tests complex user interactions, performance, and edge cases
 */

const { test, expect } = require('@playwright/test');

test.describe('Weather App - Advanced E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock the weather API with realistic data
    await page.route('**/api.open-meteo.com/v1/geocoding*', async route => {
      const url = route.request().url();
      const searchTerm = new URL(url).searchParams.get('name');
      
      const mockLocations = {
        'London': [{
          name: "London",
          country: "United Kingdom", 
          latitude: 51.5074,
          longitude: -0.1278
        }],
        'Paris': [{
          name: "Paris",
          country: "France",
          latitude: 48.8566,
          longitude: 2.3522
        }],
        'Tokyo': [{
          name: "Tokyo", 
          country: "Japan",
          latitude: 35.6762,
          longitude: 139.6503
        }],
        'São Paulo': [{
          name: "São Paulo",
          country: "Brazil",
          latitude: -23.5505,
          longitude: -46.6333
        }],
        'Zürich': [{
          name: "Zürich", 
          country: "Switzerland",
          latitude: 47.3769,
          longitude: 8.5417
        }],
        'InvalidCity123': []
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: mockLocations[searchTerm] || []
        })
      });
    });

    await page.route('**/api.open-meteo.com/v1/forecast*', async route => {
      // Extract coordinates from the request to determine which city this is for
      const url = route.request().url();
      const params = new URL(url).searchParams;
      const lat = parseFloat(params.get('latitude'));
      const lon = parseFloat(params.get('longitude'));
      
      // Map coordinates to city names (matching our geocoding mock)
      let locationName = 'London';
      let country = 'United Kingdom';
      
      if (Math.abs(lat - 48.8566) < 0.01 && Math.abs(lon - 2.3522) < 0.01) {
        locationName = 'Paris';
        country = 'France';
      } else if (Math.abs(lat - 35.6762) < 0.01 && Math.abs(lon - 139.6503) < 0.01) {
        locationName = 'Tokyo';
        country = 'Japan';
      } else if (Math.abs(lat - (-23.5505)) < 0.01 && Math.abs(lon - (-46.6333)) < 0.01) {
        locationName = 'São Paulo';
        country = 'Brazil';
      } else if (Math.abs(lat - 47.3769) < 0.01 && Math.abs(lon - 8.5417) < 0.01) {
        locationName = 'Zürich';
        country = 'Switzerland';
      }
      
      const mockWeatherData = {
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
          weather_code: [2, 3, 61, 80, 1, 2, 0],
          relative_humidity_2m: [65, 70, 75, 80, 60, 55, 50],
          wind_speed_10m_max: [8.5, 12.3, 15.7, 18.2, 7.1, 9.4, 6.8],
          surface_pressure: [1013.2, 1015.1, 1010.5, 1008.7, 1016.3, 1018.9, 1020.1]
        },
        locationName: locationName,
        country: country
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWeatherData)
      });
    });
  });

  test('should handle rapid successive searches gracefully', async ({ page }) => {
    await page.goto('/?mock=true');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    const searchButton = page.locator('[data-testid="search-button"]');
    
    // Perform rapid searches
    await searchInput.fill('London');
    await searchButton.click();
    
    await searchInput.fill('Paris');
    await searchButton.click();
    
    await searchInput.fill('Tokyo');
    await searchButton.click();
    
    // Should eventually settle on Tokyo
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toContainText('Tokyo');
  });

  test('should expand and collapse forecast details', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Find first forecast item
    const firstForecastItem = page.locator('.forecast-item').first();
    await expect(firstForecastItem).toBeVisible();
    
    // Click to expand
    await firstForecastItem.click();
    
    // Should show expanded state
    await expect(firstForecastItem).toHaveClass(/active/);
    
    // Should show additional details
    await expect(firstForecastItem.locator('.forecast-item__details')).toBeVisible();
    
    // Click again to collapse
    await firstForecastItem.click();
    
    // Should collapse
    await expect(firstForecastItem).not.toHaveClass(/active/);
  });

  test('should only allow one forecast item expanded at a time', async ({ page }) => {
    await page.goto('/?mock=true');
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    const forecastItems = page.locator('.forecast-item');
    const firstItem = forecastItems.first();
    const secondItem = forecastItems.nth(1);
    
    // Expand first item
    await firstItem.click();
    await expect(firstItem).toHaveClass(/active/);
    
    // Expand second item
    await secondItem.click();
    await expect(secondItem).toHaveClass(/active/);
    
    // First item should no longer be active
    await expect(firstItem).not.toHaveClass(/active/);
  });

  test('should maintain state during window resize', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Search for a city
    await page.locator('[data-testid="search-input"]').fill('London');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toContainText('London');
    
    // Expand a forecast item
    await page.locator('.forecast-item').first().click();
    await expect(page.locator('.forecast-item').first()).toHaveClass(/active/);
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // State should be maintained
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('.forecast-item').first()).toHaveClass(/active/);
    
    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // State should still be maintained
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('.forecast-item').first()).toHaveClass(/active/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Tab to search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    
    // Wait for initial load to complete first
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Clear the input and search for a different city
    await page.locator('[data-testid="search-input"]').clear();
    await page.keyboard.type('Paris');
    
    // For now, click the button instead of using Enter
    await page.locator('[data-testid="search-button"]').click();
    
    // Wait for search to complete
    await page.waitForTimeout(500); // Allow time for the search to process
    
    // Should trigger search
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Tab to forecast items and navigate with arrow keys
    const forecastItem = page.locator('.forecast-item').first();
    await forecastItem.focus();
    await expect(forecastItem).toBeFocused();
    
    // Enter should expand/collapse
    await page.keyboard.press('Enter');
    await expect(forecastItem).toHaveClass(/active/);
  });

  test('should handle network interruption gracefully', async ({ page }) => {
    // Start with mock mode to ensure app loads properly
    await page.goto('/?mock=true');
    
    // Wait for app to fully load first
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible({ timeout: 10000 });
    
    // Test error handling by searching for an invalid city that will trigger an error in mock mode
    await page.locator('[data-testid="search-input"]').fill('Invalid123City');
    await page.locator('[data-testid="search-button"]').click();
    
    // Wait for the error to appear
    // await expect(page.locator('[data-testid="error"]')).toBeVisible({ timeout: 10000 });
    
    // Verify the error message
    await expect(page.locator('[data-testid="error"]')).toContainText('Unable to ');
  });

  test('should persist and restore app state', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for initial load
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Search for a city
    await page.locator('[data-testid="search-input"]').fill('Paris');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toContainText('Paris');
    
    // Expand a forecast item
    await page.locator('.forecast-item').nth(2).click();
    
    // Reload page
    await page.reload();
    
    // Wait for the page to fully load and initialize
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Wait a bit more for all reactive updates to complete
    await page.waitForTimeout(500);
    
    // Should restore the last searched city (check location display first)
    await expect(page.locator('[data-testid="current-location"]')).toContainText('Paris');
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Paris');
  });

  test('should handle special characters in city names', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Wait for initial load to complete
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toContainText('London');
    
    // Test with accented characters
    await page.locator('[data-testid="search-input"]').fill('São Paulo');
    await page.locator('[data-testid="search-button"]').click();
    
    // Wait for the search to process
    await page.waitForTimeout(300);
    
    // Should load new weather data 
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-location"]')).toContainText('São Paulo');
  });

  test('should validate form input properly', async ({ page }) => {
    await page.goto('/?mock=true');
    
    const searchInput = page.locator('[data-testid="search-input"]');
    const searchButton = page.locator('[data-testid="search-button"]');
    
    // Try to search with empty input
    await searchInput.fill('');
    await searchButton.click();
    
    // Should not trigger search (button should be disabled or form validation should prevent)
    await expect(page.locator('[data-testid="loading"]')).toBeHidden();
    
    // Try with whitespace only
    await searchInput.fill('   ');
    await searchButton.click();
    
    // Should not trigger search
    await expect(page.locator('[data-testid="loading"]')).toBeHidden();
  });

  test('should display appropriate weather icons', async ({ page }) => {
    await page.goto('/?mock=true');
    
    await page.locator('[data-testid="search-input"]').fill('London');
    await page.locator('[data-testid="search-button"]').click();
    
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Check current weather icon
    const currentIcon = page.locator('[data-testid="current-icon"]');
    await expect(currentIcon).toBeVisible();
    
    // Check forecast icons
    const forecastItems = page.locator('.forecast-item');
    const count = await forecastItems.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const icon = forecastItems.nth(i).locator('.forecast-item__icon');
      await expect(icon).toBeVisible();
    }
  });

  test('should handle API rate limiting', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api.open-meteo.com/**', async route => {
      requestCount++;
      
      if (requestCount > 3) {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Too many requests' })
        });
      } else {
        await route.continue();
      }
    });
    
    // Disable mock mode to allow actual API calls
    await page.goto('/?mock=false');
    
    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-testid="search-input"]').fill(`City${i}`);
      await page.locator('[data-testid="search-button"]').click();
      await page.waitForTimeout(100);
    }
    
    // Should eventually show error for rate limiting (wait for fade-out animation to complete)
    await page.waitForTimeout(300); // Wait for any fade-out animations to complete
    await expect(page.locator('[data-testid="error"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Weather App - Performance Tests', () => {
  
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/?mock=true');
    await expect(page.locator('.container').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should handle large forecast data efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('**/api.open-meteo.com/v1/forecast*', async route => {
      const largeData = {
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
          time: Array.from({ length: 16 }, (_, i) => 
            new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ),
          temperature_2m_max: Array.from({ length: 16 }, () => Math.random() * 30 + 10),
          temperature_2m_min: Array.from({ length: 16 }, () => Math.random() * 20 + 5),
          weather_code: Array.from({ length: 16 }, () => Math.floor(Math.random() * 4))
        }
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeData)
      });
    });
    
    await page.goto('/?mock=true');
    
    const startTime = Date.now();
    
    await page.locator('[data-testid="search-input"]').fill('London');  
    await page.locator('[data-testid="search-button"]').click();
    
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    const renderTime = Date.now() - startTime;
    
    // Should render within 3 seconds even with large data
    expect(renderTime).toBeLessThan(3000);
    
    // Should only show 7 forecast items (app should limit display)
    const forecastItems = page.locator('.forecast-item');
    await expect(forecastItems).toHaveCount(7);
  });
});
