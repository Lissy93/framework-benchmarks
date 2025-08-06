import { Show } from 'solid-js';

function LoadingState(props) {
  return (
    <Show when={props.isVisible}>
      <div class="loading" data-testid="loading">
        <div class="loading__spinner"></div>
        <p>Loading weather data...</p>
      </div>
    </Show>
  );
}

export default LoadingState;