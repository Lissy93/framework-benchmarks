<template>
  <section class="search-section">
    <form 
      class="search-form" 
      data-testid="search-form"
      @submit="handleSubmit"
    >
      <div class="search-form__group">
        <label for="location-input" class="sr-only">Enter city name</label>
        <input
          id="location-input"
          v-model="inputValue"
          type="text"
          class="search-input"
          placeholder="Enter city name..."
          data-testid="search-input"
          autocomplete="off"
          :disabled="isLoading"
        />
        <button 
          type="submit" 
          class="search-button"
          data-testid="search-button"
          :disabled="isLoading"
        >
          <span class="search-button__text">
            {{ isLoading ? 'Loading...' : 'Get Weather' }}
          </span>
          <span class="search-button__icon">🌦️</span>
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  currentValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['search'])

const inputValue = ref(props.currentValue)

// Watch for changes in currentValue prop
watch(() => props.currentValue, (newValue) => {
  inputValue.value = newValue
}, { immediate: true })

const handleSubmit = (event) => {
  event.preventDefault()
  const city = inputValue.value.trim()
  if (city) {
    emit('search', city)
  }
}
</script>