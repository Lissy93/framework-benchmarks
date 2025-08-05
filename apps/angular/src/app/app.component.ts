import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WeatherStateService } from './services/weather-state.service';
import { AppState } from './types/weather.types';

import { SearchFormComponent } from './components/search-form.component';
import { LoadingStateComponent } from './components/loading-state.component';
import { ErrorStateComponent } from './components/error-state.component';
import { WeatherContentComponent } from './components/weather-content.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SearchFormComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    WeatherContentComponent
  ],
  template: `
    <header class="header">
      <div class="container">
        <h1 class="header__title">Weather Front</h1>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <app-search-form 
          [isLoading]="state.isLoading"
          (search)="onSearch($event)"
        ></app-search-form>

        <div class="weather-container" data-testid="weather-container">
          <app-loading-state [isVisible]="state.isLoading"></app-loading-state>
          
          <app-error-state 
            [isVisible]="!!state.error && !state.isLoading" 
            [message]="state.error"
          ></app-error-state>
          
          <app-weather-content 
            [isVisible]="!!state.weatherData && !state.isLoading && !state.error"
            [weatherData]="state.weatherData"
          ></app-weather-content>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer__text">
          Built with Angular • MIT License • 
          <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">
            Alicia Sykes
          </a>
        </p>
      </div>
    </footer>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  state: AppState = {
    weatherData: null,
    isLoading: false,
    error: null
  };

  private destroy$ = new Subject<void>();

  constructor(private weatherStateService: WeatherStateService) {}

  ngOnInit(): void {
    this.weatherStateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(city: string): void {
    this.weatherStateService.loadWeather(city);
  }
}