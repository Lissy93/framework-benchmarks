<template>
  <div class="weather-content" data-testid="weather-content">
    <div class="weather-layout">
      <CurrentWeather :weather-data="weatherData" />
      <Forecast :weather-data="weatherData" />
    </div>
  </div>
</template>

<script setup>
import CurrentWeather from './CurrentWeather.vue'
import Forecast from './Forecast.vue'

defineProps({
  weatherData: {
    type: Object,
    required: true
  }
})
</script>