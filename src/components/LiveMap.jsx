import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function LiveMap({
  deliveryLocation,
  customerLocation,
}) {
  const mapRef = useRef();

  if (!deliveryLocation || !customerLocation) {
    return (
      <div className="text-gray-500">
        Waiting for location...
      </div>
    );
  }

  const deliveryPos = [
    deliveryLocation.lat,
    deliveryLocation.lng,
  ];

  const customerPos = [
    customerLocation.lat,
    customerLocation.lng,
  ];

  useEffect(() => {
    if (mapRef.current) {
      const bounds = L.latLngBounds([
        deliveryPos,
        customerPos,
      ]);

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [deliveryLocation, customerLocation]);

  return (
    <MapContainer
      center={customerPos}
      zoom={13}
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "16px",
      }}
      whenCreated={(map) => (mapRef.current = map)}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Delivery Boy */}
      <Marker position={deliveryPos} />

      {/* Customer */}
      <Marker position={customerPos} />

      {/* Line */}
      <Polyline
        positions={[deliveryPos, customerPos]}
        color="blue"
      />
    </MapContainer>
  );
}