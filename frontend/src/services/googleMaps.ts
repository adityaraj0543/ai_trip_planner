import { Loader } from '@googlemaps/js-api-loader';
import { getPublicConfig } from './api';

let mapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps() {
  if (!mapsPromise) {
    mapsPromise = getPublicConfig().then(({ googleMapsApiKey }) => {
      if (!googleMapsApiKey) {
        throw new Error('Google Maps API key is not configured. Add GOOGLE_MAPS_API_KEY to backend/.env.');
      }

      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: 'weekly',
      });

      return loader.load().then(() => google.maps);
    });
  }

  return mapsPromise;
}
