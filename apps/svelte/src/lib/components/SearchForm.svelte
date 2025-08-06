<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let isLoading = false;
  export let currentLocation = null;

  const dispatch = createEventDispatcher();
  let inputElement;
  let inputValue = '';

  onMount(() => {
    if (browser) {
      // Set initial value from localStorage
      const savedLocation = getSavedLocation();
      if (savedLocation) {
        inputValue = savedLocation;
        hasInitialized = true;
      }
      // Don't set a default value if no saved location
    }
  });

  let hasInitialized = false;

  // Only update input value from currentLocation on initial load if no saved location exists
  $: if (currentLocation && !inputValue && !hasInitialized) {
    inputValue = currentLocation;
  }

  function handleSubmit() {
    const city = inputValue?.trim();
    
    if (!city) {
      return;
    }
    
    dispatch('search', city);
  }


  function getSavedLocation() {
    if (!browser) return null;
    
    try {
      return localStorage.getItem('weather-app-location');
    } catch (error) {
      console.warn('Could not load saved location:', error);
      return null;
    }
  }
</script>

<section class="search-section">
  <form class="search-form" data-testid="search-form" on:submit|preventDefault={handleSubmit}>
    <div class="search-form__group">
      <label for="location-input" class="sr-only">Enter city name</label>
      <input 
        bind:this={inputElement}
        bind:value={inputValue}
        type="text" 
        id="location-input"
        class="search-input" 
        placeholder="Enter city name..."
        data-testid="search-input"
        autocomplete="off"
      />
      <button 
        type="submit" 
        class="search-button" 
        data-testid="search-button"
        disabled={isLoading}
      >
        <span class="search-button__text">
          {isLoading ? 'Loading...' : 'Get Weather'}
        </span>
        <span class="search-button__icon">🌦️</span>
      </button>
    </div>
  </form>
</section>