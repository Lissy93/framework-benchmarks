import { component$ } from '@builder.io/qwik';

export const LoadingState = component$(() => {
  return (
    <div class="loading" data-testid="loading">
      <div class="loading__spinner"></div>
      <p>Loading weather data...</p>
    </div>
  );
});
