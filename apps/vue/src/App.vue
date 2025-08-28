<template>
  <header class="header">
    <div class="container">
      <h1 class="header__title">Weather Front</h1>
    </div>
  </header>

  <main class="main">
    <div class="container">
      <SearchForm 
        @search="searchWeather" 
        :is-loading="isLoading"
        :current-value="searchValue"
      />
      
      <div class="weather-container" data-testid="weather-container">
        <LoadingState v-if="isLoading" />
        
        <ErrorState 
          v-if="error && !isLoading" 
          :message="error" 
        />
        
        <WeatherContent 
          v-if="weatherData && !isLoading && !error" 
          :weather-data="weatherData" 
        />
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <p class="footer__text">
        Built with Vue 3 • MIT License • 
        <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">Alicia Sykes</a>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SearchForm from './components/SearchForm.vue'
import LoadingState from './components/LoadingState.vue'
import ErrorState from './components/ErrorState.vue'
import WeatherContent from './components/WeatherContent.vue'
import { weatherService } from './services/weatherService.js'

const weatherData = ref(null)
const isLoading = ref(false)
const error = ref(null)
const searchValue = ref('London')

const searchWeather = async (city) => {
  isLoading.value = true
  error.value = null
  
  try {
    const data = await weatherService.getWeatherByCity(city)
    weatherData.value = data
    searchValue.value = city
    
    // Save to localStorage
    try {
      localStorage.setItem('weather-app-location', city)
    } catch (e) {
      // Ignore localStorage errors
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch weather data'
    weatherData.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  let initialCity = 'London'
  
  // Try to get saved location from localStorage
  try {
    const savedLocation = localStorage.getItem('weather-app-location')
    if (savedLocation) {
      initialCity = savedLocation
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  await searchWeather(initialCity)
})
</script>