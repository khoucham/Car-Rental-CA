import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

// Fix marker icon (Vite / React bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DUBLIN_AIRPORT = {
  lat: 53.4264,
  lng: -6.2499,
};

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ onChange }) {
  const [position, setPosition] = useState(DUBLIN_AIRPORT);

  return (
    <MapContainer
      center={[DUBLIN_AIRPORT.lat, DUBLIN_AIRPORT.lng]}
      zoom={14}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler
        onSelect={(latlng) => {
          setPosition(latlng);
          onChange(latlng);
        }}
      />

      <Marker position={position} />
    </MapContainer>
  );
}
