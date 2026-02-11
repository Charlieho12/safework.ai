import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Immagine } from '@/types';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapViewProps {
  images: Immagine[];
  height?: string;
}

export default function MapView({ images, height = '400px' }: MapViewProps) {
  // Filter images with geolocation
  const imagesWithLocation = useMemo(() => {
    return images.filter(img => 
      img.geolocalizzazione?.lat && img.geolocalizzazione?.lng
    );
  }, [images]);

  // Calculate center based on images or default to Italy
  const center = useMemo(() => {
    if (imagesWithLocation.length === 0) {
      return [41.9028, 12.4964]; // Rome, Italy
    }
    const avgLat = imagesWithLocation.reduce((sum, img) => sum + (img.geolocalizzazione?.lat || 0), 0) / imagesWithLocation.length;
    const avgLng = imagesWithLocation.reduce((sum, img) => sum + (img.geolocalizzazione?.lng || 0), 0) / imagesWithLocation.length;
    return [avgLat, avgLng];
  }, [imagesWithLocation]);

  if (imagesWithLocation.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-slate-500">Nessuna geolocalizzazione disponibile</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={13}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {imagesWithLocation.map((img, idx) => (
        <Marker
          key={img.id}
          position={[img.geolocalizzazione!.lat, img.geolocalizzazione!.lng]}
          icon={defaultIcon}
        >
          <Popup>
            <div className="space-y-2">
              <p className="font-semibold">Foto {idx + 1}</p>
              {img.url_immagine && (
                <img 
                  src={img.url_immagine} 
                  alt={`Foto ${idx + 1}`}
                  className="w-32 h-24 object-cover rounded"
                />
              )}
              <p className="text-sm text-slate-600">
                {img.descrizione_utente || 'Nessuna descrizione'}
              </p>
              {img.analisi_ai && (
                <div className="text-xs">
                  <span className={`px-2 py-1 rounded ${
                    img.analisi_ai.livello_rischio === 'critico' ? 'bg-red-100 text-red-700' :
                    img.analisi_ai.livello_rischio === 'alto' ? 'bg-orange-100 text-orange-700' :
                    img.analisi_ai.livello_rischio === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {img.analisi_ai.livello_rischio.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
