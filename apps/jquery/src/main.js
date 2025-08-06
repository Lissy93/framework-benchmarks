import $ from 'jquery'
import { WeatherService } from './services/weather-service.js'
import { WeatherUI } from './components/weather-ui.js'

$(document).ready(function() {
  const weatherService = new WeatherService()
  const weatherUI = new WeatherUI()
  
  // Cache jQuery elements
  const $searchForm = $('[data-testid="search-form"]')
  const $searchInput = $('[data-testid="search-input"]')
  
  // Track current search request to handle rapid successive searches
  let currentSearchRequest = null
  let searchTimeout = null
  
  // Initialize app state - matching vanilla behavior
  const savedLocation = localStorage.getItem('lastSearchedCity') || 'London'
  $searchInput.val(savedLocation)
  
  // Load initial weather data automatically
  loadWeatherData(savedLocation)
  
  // Handle form submission with jQuery
  $searchForm.on('submit', function(e) {
    e.preventDefault()
    const city = $searchInput.val().trim()
    
    // Validate input like vanilla app
    if (!city) {
      return
    }
    
    // Clear any pending search timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      searchTimeout = null
    }
    
    // For rapid successive searches, add a small delay
    searchTimeout = setTimeout(() => {
      loadWeatherData(city)
      searchTimeout = null
    }, 500)
  })
  
  // Main weather loading function - matching vanilla app flow
  async function loadWeatherData(cityName) {
    try {
      // Cancel any previous request
      if (currentSearchRequest) {
        console.log('Cancelling previous search request')
        currentSearchRequest = null
      }
      
      // Create a new request identifier
      const requestId = Date.now()
      currentSearchRequest = requestId
      
      // Show loading state
      weatherUI.showLoading()
      
      // Fetch weather data using service
      const weatherData = await weatherService.getCurrentWeather(cityName)
      
      // Check if this request is still the current one
      if (currentSearchRequest !== requestId) {
        console.log('Search request superseded, ignoring result')
        return
      }
      
      // Update UI with weather data
      weatherUI.showWeatherContent(weatherData)
      
      // Save to localStorage like vanilla app
      localStorage.setItem('lastSearchedCity', cityName)
      $searchInput.val(cityName)
      
      // Clear current request
      currentSearchRequest = null
      
    } catch (error) {
      // Check if this request is still current before showing error
      if (currentSearchRequest) {
        console.error('Weather loading error:', error)
        weatherUI.showError(error.message)
        currentSearchRequest = null
      }
    }
  }
  
  // Event handlers are now attached directly to elements in WeatherUI component
})