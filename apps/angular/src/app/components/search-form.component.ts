import { Component, Output, EventEmitter, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="search-section">
      <form class="search-form" data-testid="search-form" (ngSubmit)="onSubmit()">
        <div class="search-form__group">
          <label for="location-input" class="sr-only">Enter city name</label>
          <input 
            #locationInput
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
            [disabled]="isLoading"
          >
            <span class="search-button__text">
              {{ isLoading ? 'Loading...' : 'Get Weather' }}
            </span>
            <span class="search-button__icon">🌦️</span>
          </button>
        </div>
      </form>
    </section>
  `
})
export class SearchFormComponent implements AfterViewInit {
  @Input() isLoading = false;
  @Output() search = new EventEmitter<string>();
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    // Set initial value from localStorage
    const savedLocation = this.getSavedLocation();
    if (savedLocation) {
      this.locationInput.nativeElement.value = savedLocation;
    } else {
      this.locationInput.nativeElement.value = 'London';
    }
  }

  onSubmit(): void {
    const city = this.locationInput.nativeElement.value?.trim();
    
    if (!city) {
      return;
    }
    
    this.search.emit(city);
  }

  private getSavedLocation(): string | null {
    try {
      return localStorage.getItem('weather-app-location');
    } catch (error) {
      console.warn('Could not load saved location:', error);
      return null;
    }
  }
}