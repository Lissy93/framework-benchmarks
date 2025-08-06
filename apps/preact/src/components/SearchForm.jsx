import { useState, useEffect } from 'preact/hooks';

const SearchForm = ({ isLoading = false, currentLocation = null, onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Set initial value from localStorage
    const savedLocation = getSavedLocation();
    if (savedLocation) {
      setInputValue(savedLocation);
      setHasInitialized(true);
    }
    // Don't set a default value if no saved location
  }, []);

  // Only update input value from currentLocation on initial load if no saved location exists
  useEffect(() => {
    if (currentLocation && !inputValue && !hasInitialized) {
      setInputValue(currentLocation);
    }
  }, [currentLocation, inputValue, hasInitialized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const city = inputValue?.trim();
    
    if (!city) {
      return;
    }
    
    onSearch?.(city);
  };

  return (
    <section class="search-section">
      <form class="search-form" data-testid="search-form" onSubmit={handleSubmit}>
        <div class="search-form__group">
          <label for="location-input" class="sr-only">Enter city name</label>
          <input 
            value={inputValue}
            onInput={(e) => setInputValue(e.target.value)}
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
  );
};

function getSavedLocation() {
  try {
    return localStorage.getItem('weather-app-location');
  } catch (error) {
    console.warn('Could not load saved location:', error);
    return null;
  }
}

export default SearchForm;