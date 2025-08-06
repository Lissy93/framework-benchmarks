import { createContextId } from '@builder.io/qwik';
import type { WeatherData } from '../services/WeatherService';

export interface WeatherState {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  latestRequestId: number;
}

export const WeatherContext = createContextId<WeatherState>('weather');