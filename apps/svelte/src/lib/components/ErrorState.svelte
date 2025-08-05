<script>
  export let isVisible = false;
  export let message = null;
</script>

<div 
  class="error" 
  data-testid="error" 
  hidden={!isVisible}
>
  <h2 class="error__title">Unable to load weather data</h2>
  <p class="error__message">
    {message || 'Please check the city name and try again.'}
  </p>
</div>