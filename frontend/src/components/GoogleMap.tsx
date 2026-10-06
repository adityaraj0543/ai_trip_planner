import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/googleMaps';

export interface MapPoint {
  name: string;
  lat: number;
  lng: number;
  emoji?: string;
  details?: string;
}

interface GoogleMapProps {
  center: [number, number];
  zoom?: number;
  points: MapPoint[];
  dark?: boolean;
}

export default function GoogleMap({ center, zoom = 13, points, dark = false }: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const pointsKey = JSON.stringify(points);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;

        const map = new maps.Map(containerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          colorScheme: dark ? 'DARK' : 'LIGHT',
        });
        mapRef.current = map;

        const infoWindow = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();

        markersRef.current = points.map((point) => {
          const marker = new maps.Marker({
            map,
            position: { lat: point.lat, lng: point.lng },
            title: point.name,
          });
          marker.addListener('click', () => {
            infoWindow.setContent(`<div style="min-width:180px"><strong>${point.emoji || '📍'} ${point.name}</strong><br/><span>${point.details || ''}</span></div>`);
            infoWindow.open({ map, anchor: marker });
          });
          bounds.extend({ lat: point.lat, lng: point.lng });
          return marker;
        });

        if (points.length > 1) map.fitBounds(bounds, 50);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Unable to load Google Maps.');
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => {
        // google.maps.Marker supports setMap; keep this cast compatible with both marker implementations.
        marker.setMap(null);
      });
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [center[0], center[1], dark, pointsKey, zoom]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-semibold mb-2">Google Maps could not load</p>
          <p className="text-sm opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" aria-label="Google Maps itinerary map" />;
}
