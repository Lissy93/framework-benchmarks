import { LitElement, html, css } from 'lit';
import { designSystemStyles, baseStyles, componentStyles } from './shared-styles.js';

export class WeatherSearch extends LitElement {
  // eslint-disable-next-line
  static styles = [
    designSystemStyles,
    baseStyles, 
    componentStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  // eslint-disable-next-line
  static properties = {
    searchQuery: { type: String },
    isLoading: { type: Boolean }
  };

  constructor() {
    super();
    this.searchQuery = '';
    this.isLoading = false;
  }

  render() {
    return html`
      <section class="search-section">
        <form 
          class="search-form" 
          data-testid="search-form"
          @submit=${this._handleSubmit}
        >
          <div class="search-form__group">
            <label for="location-input" class="sr-only">Enter city name</label>
            <input 
              type="text" 
              id="location-input"
              class="search-input" 
              placeholder="Enter city name..."
              data-testid="search-input"
              autocomplete="off"
              .value=${this.searchQuery}
              @input=${this._handleInput}
            >
            <button 
              type="submit" 
              class="search-button" 
              data-testid="search-button"
              ?disabled=${this.isLoading}
            >
              <span class="search-button__text">${this.isLoading ? 'Loading...' : 'Get Weather'}</span>
              <span class="search-button__icon">🌦️</span>
            </button>
          </div>
        </form>
      </section>
    `;
  }

  _handleInput(e) {
    this.searchQuery = e.target.value;
    this.dispatchEvent(new CustomEvent('search-input', {
      detail: { query: this.searchQuery },
      bubbles: true,
      composed: true
    }));
  }

  _handleSubmit(e) {
    e.preventDefault();
    const city = this.searchQuery.trim();
    
    if (!city) {
      this.dispatchEvent(new CustomEvent('search-error', {
        detail: { message: 'Please enter a city name' },
        bubbles: true,
        composed: true
      }));
      return;
    }

    this.dispatchEvent(new CustomEvent('search-submit', {
      detail: { city },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('weather-search', WeatherSearch);