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
  @import '../../static/styles/design-system.css';
  @import '../../static/styles/variables.css';
  @import '../../static/styles/base.css';
  @import '../../static/styles/components.css';
</style>
