import { Show } from 'solid-js';

function ErrorState(props) {
  return (
    <Show when={props.isVisible}>
      <div class="error" data-testid="error">
        <p class="error__message">{props.message}</p>
      </div>
    </Show>
  );
}

export default ErrorState;
