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
  @import '/styles/design-system.css';
  @import '/styles/variables.css';
  @import '/styles/base.css';
  @import '/styles/components.css';
</style>