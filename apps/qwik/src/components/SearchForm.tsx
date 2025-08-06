import { component$, useSignal, $, useTask$ } from '@builder.io/qwik';

interface SearchFormProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
  currentValue?: string;
}

export const SearchForm = component$<SearchFormProps>(({ onSearch, isLoading, currentValue }) => {
  const inputValue = useSignal(currentValue || '');

  // Update input value when currentValue changes
  useTask$(({ track }) => {
    track(() => currentValue);
    if (currentValue !== undefined) {
      inputValue.value = currentValue;
    }
  });

  const handleSubmit = $((event: SubmitEvent) => {
    event.preventDefault();
    const city = inputValue.value.trim();
    if (city) {
      onSearch(city);
    }
  });

  return (
    <section class="search-section">
      <form
        class="search-form"
        data-testid="search-form"
        preventdefault:submit
        onSubmit$={handleSubmit}
      >
        <div class="search-form__group">
          <label for="location-input" class="sr-only">Enter city name</label>
          <input
            id="location-input"
            type="text"
            class="search-input"
            placeholder="Enter city name..."
            data-testid="search-input"
            data-testid="search-input"
            autocomplete="off"
            bind:value={inputValue}
            disabled={isLoading}
            tabIndex={1}
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
  );
});
