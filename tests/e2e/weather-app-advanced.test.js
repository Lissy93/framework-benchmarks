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
          country: "GB", 
          latitude: 51.5074,
          longitude: -0.1278
        }],
        'Paris': [{
          name: "Paris",
          country: "FR",
          latitude: 48.8566,
          longitude: 2.3522
        }],
        'Tokyo': [{
          name: "Tokyo", 
          country: "JP",
          latitude: 35.6762,
          longitude: 139.6503
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
        }
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
    
    // Search for a city
    await page.locator('[data-testid="search-input"]').fill('London');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
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
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    
    // Type and search with Enter
    await page.keyboard.type('London');
    await page.keyboard.press('Enter');
    
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
    // Disable mock mode to allow actual API calls
    await page.goto('/?mock=false');
    
    // Start a search
    await page.locator('[data-testid="search-input"]').fill('London');
    
    // Intercept and delay the API call
    await page.route('**/api.open-meteo.com/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.abort('failed');
    });
    
    await page.locator('[data-testid="search-button"]').click();
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    
    // Should eventually show error (wait for fade-out animation to complete)
    await page.waitForTimeout(300); // Wait for any fade-out animations to complete
    await expect(page.locator('[data-testid="error"]')).toBeVisible({ timeout: 10000 });
  });

  test('should persist and restore app state', async ({ page }) => {
    await page.goto('/?mock=true');
    
    // Search for a city
    await page.locator('[data-testid="search-input"]').fill('Paris');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
    
    // Expand a forecast item
    await page.locator('.forecast-item').nth(2).click();
    
    // Reload page
    await page.reload();
    
    // Should restore the last searched city
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Paris');
    await expect(page.locator('[data-testid="current-weather"]')).toBeVisible();
  });

  test('should handle special characters in city names', async ({ page }) => {
    // Add mock for special character cities
    await page.route('**/api.open-meteo.com/v1/geocoding*', async route => {
      const url = route.request().url();
      const searchTerm = new URL(url).searchParams.get('name');
      
      const specialCities = {
        'São Paulo': [{
          name: "São Paulo",
          country: "BR",
          latitude: -23.5505,
          longitude: -46.6333
        }],
        'Zürich': [{
          name: "Zürich", 
          country: "CH",
          latitude: 47.3769,
          longitude: 8.5417
        }]
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: specialCities[searchTerm] || []
        })
      });
    });
    
    await page.goto('/?mock=true');
    
    // Test with accented characters
    await page.locator('[data-testid="search-input"]').fill('São Paulo');
    await page.locator('[data-testid="search-button"]').click();
    
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
    expect(loadTime).toBeLessThan(2000);
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