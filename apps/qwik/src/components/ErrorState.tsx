import { component$ } from '@builder.io/qwik';

interface ErrorStateProps {
  message: string;
}

export const ErrorState = component$<ErrorStateProps>(({ message }) => {
  return (
    <div class="error" data-testid="error">
      <h2 class="error__title">Unable to fetch weather data</h2>
      <p class="error__message">{message}</p>
    </div>
  );
});
