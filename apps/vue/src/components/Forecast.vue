<template>
  <section class="forecast-section">
    <h2 class="section-title">7-Day Forecast</h2>
    <div class="forecast">
      <div class="forecast__list" data-testid="forecast-list">
        <ForecastItem
          v-for="(item, index) in forecastItems"
          :key="index"
          :forecast-data="item"
          :is-active="activeIndex === index"
          @click="toggleItem(index)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import ForecastItem from './ForecastItem.vue'
import { WeatherUtils } from '../utils/weatherUtils.js'

const props = defineProps({
  weatherData: {
    type: Object,
    required: true
  }
})

const activeIndex = ref(null)

const forecastItems = computed(() => {
  const daily = props.weatherData.daily
  
  return daily.time.map((date, index) => ({
    date,
    high: daily.temperature_2m_max[index],
    low: daily.temperature_2m_min[index],
    weatherCode: daily.weather_code[index],
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
    rainSum: daily.rain_sum[index],
    uvIndex: daily.uv_index_max[index],
    precipitationProb: daily.precipitation_probability_max[index]
  }))
})

const toggleItem = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>