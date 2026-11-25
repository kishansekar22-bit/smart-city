import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { pickerPinIcon } from "../utils/leafletIcons";
import { MapPin, Navigation, Check } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number, addressSuggestion?: string) => void;
}

// Inner component to capture click events on the Leaflet map
const ClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({
  onLocationSelect,
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
}) => {
  // Default to Bengaluru City Center if not provided
  const centerLat = latitude || 12.9716;
  const centerLng = longitude || 77.5946;

  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : [12.9716, 77.5946]
  );
  const [isLocating, setIsLocating] = useState(false);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          handleSelect(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setIsLocating(false);
          // fallback to city center
          handleSelect(12.9716, 77.5946);
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="w-4 h-4 text-brand-600" />
          <span>Click anywhere on the map to place the issue pin:</span>
        </div>
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 text-brand-600 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Locating GPS..." : "Use My Current Location"}</span>
        </button>
      </div>

      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner relative">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={handleSelect} />
          {position && (
            <Marker
              position={position}
              icon={pickerPinIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  handleSelect(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {position && (
        <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-700">
              Selected GPS Coordinates: <strong>{position[0].toFixed(5)}, {position[1].toFixed(5)}</strong>
            </span>
          </div>
          <span className="text-brand-700 font-semibold text-[11px]">Pin Placed</span>
        </div>
      )}
    </div>
  );
};