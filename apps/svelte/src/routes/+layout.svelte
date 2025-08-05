<script>
  import { onMount } from 'svelte';
  import { weatherStore } from '$lib/stores/weather-store.js';

  // Initialize the weather store when the app loads
  onMount(async () => {
    await weatherStore.initialize();
  });
</script>

<main>
  <slot />
</main>

<style>
  @import '/assets/styles/design-system.css';
  @import '/assets/styles/variables.css';
  @import '/assets/styles/base.css';
  @import '/assets/styles/components.css';
</style>