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
  @import '../../static/assets/styles/design-system.css';
  @import '../../static/assets/styles/variables.css';
  @import '../../static/assets/styles/base.css';
  @import '../../static/assets/styles/components.css';
</style>
