<template>
  <div class="error" data-testid="error">
    <h2 class="error__title">Unable to fetch weather data</h2>
    <p class="error__message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})
</script>