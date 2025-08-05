<script>
  export let isVisible = false;
  export let message = null;
</script>

<div 
  class="error" 
  data-testid="error" 
  hidden={!isVisible}
>
  <h2 class="error__title">Error</h2>
  <p class="error__message">
    {message || 'Unable to load weather data. Please try again.'}
  </p>
</div>