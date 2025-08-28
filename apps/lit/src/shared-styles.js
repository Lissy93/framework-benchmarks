import { css } from 'lit';

// Import shared CSS as Lit css template literals
// This allows them to be used in Shadow DOM while maintaining the "Lit way"

export const designSystemStyles = css`
  /* Design System Variables - imported from design-system.css */
  :host {
    --color-primary: #3b82f6;
    --color-primary-dark: #2563eb;
    --color-secondary: #6b7280;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-background: #ffffff;
    --color-background-secondary: #f9fafb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-text-light: #9ca3af;
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;
    
    --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.375rem;
    --border-radius-lg: 0.5rem;
    --border-radius-xl: 0.75rem;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    --spacing-24: 6rem;
    --spacing-32: 8rem;
  }
`;

export const baseStyles = css`
  /* Base styles */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-4);
  }
  
  @media (min-width: 640px) {
    .container {
      padding: 0 var(--spacing-6);
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      padding: 0 var(--spacing-8);
    }
  }
`;

export const componentStyles = css`
  /* Header */
  .header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    padding: var(--spacing-6) 0;
    box-shadow: var(--shadow-md);
  }
  
  .header__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    margin: 0;
    text-align: center;
    letter-spacing: -0.025em;
  }
  
  /* Main */
  .main {
    flex: 1;
    padding: var(--spacing-8) 0;
    min-height: calc(100vh - 200px);
  }
  
  /* Search Section */
  .search-section {
    margin-bottom: var(--spacing-8);
  }
  
  .search-form__group {
    display: flex;
    gap: var(--spacing-3);
    max-width: 600px;
    margin: 0 auto;
  }
  
  .search-input {
    flex: 1;
    padding: var(--spacing-3) var(--spacing-4);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-family: var(--font-family-sans);
    background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .search-input::placeholder {
    color: var(--color-text-light);
  }
  
  .search-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-5);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    white-space: nowrap;
  }
  
  .search-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }
  
  .search-button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .search-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .search-button__text {
    font-weight: var(--font-weight-medium);
  }
  
  .search-button__icon {
    font-size: var(--font-size-lg);
  }
  
  /* Loading */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-16);
    text-align: center;
  }
  
  .loading__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-4);
  }
  
  .loading p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    margin: 0;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error */
  .error {
    text-align: center;
    padding: var(--spacing-12);
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-8) 0;
  }
  
  .error__title {
    color: var(--color-error);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin: 0 0 var(--spacing-2) 0;
  }
  
  .error__message {
    color: #991b1b;
    font-size: var(--font-size-base);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }
  
  /* Weather Content */
  .weather-content {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .weather-layout {
    display: grid;
    gap: var(--spacing-8);
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 1024px) {
    .weather-layout {
      grid-template-columns: 400px 1fr;
    }
  }
  
  .section-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0 0 var(--spacing-6) 0;
    text-align: center;
  }
  
  @media (min-width: 1024px) {
    .section-title {
      text-align: left;
    }
  }
  
  /* Weather Card */
  .weather-card {
    background: white;
    border-radius: var(--border-radius-xl);
    padding: var(--spacing-8);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-light);
  }
  
  .current-weather__location {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0 0 var(--spacing-6) 0;
    text-align: center;
  }
  
  .current-weather__main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    flex-wrap: wrap;
  }
  
  .current-weather__icon {
    font-size: 4rem;
    line-height: 1;
  }
  
  .current-weather__temp-group {
    text-align: center;
  }
  
  .current-weather__temp {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    line-height: var(--line-height-tight);
    margin-bottom: var(--spacing-2);
  }
  
  .current-weather__condition {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    text-transform: capitalize;
  }
  
  .weather-condition-sunny { color: #f59e0b; }
  .weather-condition-cloudy { color: #6b7280; }
  .weather-condition-rainy { color: #3b82f6; }
  .weather-condition-stormy { color: #7c3aed; }
  
  .current-weather__details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-4);
  }
  
  .weather-detail {
    text-align: center;
    padding: var(--spacing-3);
    background: var(--color-background-secondary);
    border-radius: var(--border-radius-md);
  }
  
  .weather-detail__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-1);
  }
  
  .weather-detail__value {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }
  
  /* Forecast */
  .forecast__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .forecast-item {
    background: white;
    border: 1px solid var(--color-border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-5);
    cursor: pointer;
    transition: all 0.3s ease;
    display: grid;
    grid-template-columns: 100px 60px 1fr;
    align-items: center;
    gap: var(--spacing-4);
  }
  
  .forecast-item:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }
  
  .forecast-item:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    border-color: var(--color-primary);
  }
  
  .forecast-item.active {
    background: var(--color-background-secondary);
    border-color: var(--color-primary);
  }
  
  .forecast-item__day {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    font-size: var(--font-size-base);
  }
  
  .forecast-item__icon {
    font-size: var(--font-size-2xl);
    text-align: center;
  }
  
  .forecast-item__condition {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-1);
  }
  
  .forecast-item__temps {
    display: flex;
    gap: var(--spacing-2);
  }
  
  .forecast-item__high {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }
  
  .forecast-item__low {
    color: var(--color-text-secondary);
  }
  
  .forecast-item__details {
    grid-column: 1 / -1;
    margin-top: var(--spacing-4);
    padding-top: var(--spacing-4);
    border-top: 1px solid var(--color-border-light);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-3);
  }
  
  .forecast-detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2);
    background: white;
    border-radius: var(--border-radius-sm);
  }
  
  .forecast-detail-item__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  .forecast-detail-item__value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }
  
  /* Footer */
  .footer {
    background: var(--color-background-secondary);
    border-top: 1px solid var(--color-border);
    padding: var(--spacing-6) 0;
    margin-top: auto;
  }
  
  .footer__text {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }
  
  .footer__link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
  }
  
  .footer__link:hover {
    text-decoration: underline;
  }
  
  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .search-form__group {
      flex-direction: column;
    }
    
    .forecast-item {
      grid-template-columns: 80px 50px 1fr;
      gap: var(--spacing-3);
    }
    
    .current-weather__main {
      flex-direction: column;
      gap: var(--spacing-4);
    }
    
    .current-weather__details {
      grid-template-columns: 1fr 1fr;
    }
    
    .forecast-item__details {
      grid-template-columns: 1fr;
    }
  }
`;