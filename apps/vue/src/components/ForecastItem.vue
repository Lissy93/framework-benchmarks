<template>
  <div 
    class="forecast-item"
    :class="{ active: isActive }"
    data-testid="forecast-item"
    @click="$emit('click')"
    tabindex="0"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="forecast-item__day">{{ dayName }}</div>
    <div class="forecast-item__icon">{{ icon }}</div>
    <div class="forecast-item__info">
      <div class="forecast-item__condition">{{ condition }}</div>
      <div class="forecast-item__temps" data-testid="forecast-temps">
        <span class="forecast-item__high" data-testid="forecast-high">
          {{ WeatherUtils.formatTemperature(forecastData.high) }}
        </span>
        <span class="forecast-item__low" data-testid="forecast-low">
          {{ WeatherUtils.formatTemperature(forecastData.low) }}
        </span>
      </div>
    </div>
    
    <div v-if="isActive" class="forecast-item__details">
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Sunrise</div>
        <div class="forecast-detail-item__value">{{ WeatherUtils.formatTime(forecastData.sunrise) }}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Sunset</div>
        <div class="forecast-detail-item__value">{{ WeatherUtils.formatTime(forecastData.sunset) }}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Rain</div>
        <div class="forecast-detail-item__value">{{ forecastData.rainSum.toFixed(1) }} mm</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">UV Index</div>
        <div class="forecast-detail-item__value">{{ forecastData.uvIndex.toFixed(1) }}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Precipitation</div>
        <div class="forecast-detail-item__value">{{ WeatherUtils.formatPercentage(forecastData.precipitationProb) }}</div>
      </div>
      <div class="forecast-detail-item">
        <div class="forecast-detail-item__label">Temperature</div>
        <div class="forecast-detail-item__value">
          {{ WeatherUtils.formatTemperature(forecastData.high) }} / {{ WeatherUtils.formatTemperature(forecastData.low) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { WeatherUtils } from '../utils/weatherUtils.js'

const props = defineProps({
  forecastData: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const dayName = computed(() => {
  return WeatherUtils.formatDate(props.forecastData.date)
})

const icon = computed(() => {
  return WeatherUtils.getWeatherIcon(props.forecastData.weatherCode, 1)
})

const condition = computed(() => {
  return WeatherUtils.getWeatherDescription(props.forecastData.weatherCode)
})
</script>