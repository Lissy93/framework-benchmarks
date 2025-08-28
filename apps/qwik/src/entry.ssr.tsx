import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';
import Root from './root';
import { getWeatherByCity } from './services/WeatherService';

export default async function (opts: RenderToStreamOptions) {
  let initialWeatherData = null;
  try {
    initialWeatherData = await getWeatherByCity('London');
  } catch (error) {
    console.error('Failed to pre-fetch weather data:', error);
  }

  return renderToStream(<Root initialWeatherData={initialWeatherData} />, {
    manifest: opts.manifest,
    ...opts,
    containerAttributes: {
      lang: 'en-us',
      ...opts.containerAttributes,
    },
  });
}
