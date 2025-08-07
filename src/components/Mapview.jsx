import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom user location icon (red marker)
const userLocationIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUgMEM1LjYgMCAwIDUuNiAwIDEyLjVDMCAxOS40IDEyLjUgNDEgMTIuNSA0MUMyNS4wIDQxIDI1IDE5LjQgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMFoiIGZpbGw9IiNGRjAwMDAiLz4KPGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapView = ({
  selectedPosition,
  setSelectedPosition,
  userLocation,
  radius,
}) => {
  const mapRef = useRef();

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  // Auto-zoom to user location when available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      const map = mapRef.current;
      if (map && map.setView) {
        map.setView(userLocation, 15);
      }
    }
  }, [userLocation]);

  return (
    <div className="w-full mb-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-[#2563EB] p-4">
          <p className="text-white text-sm font-medium">
            🌍 Interactive Map - Tap to set location
          </p>
        </div>

        {/* CRITICAL FIX: Explicit height with important flag */}
        <div className="w-full relative" style={{ height: "400px" }}>
          <MapContainer
            center={userLocation || selectedPosition || [20.5937, 78.9629]}
            zoom={userLocation ? 15 : 5}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            ref={mapRef}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler />

            {/* Selected location marker and geofence circle */}
            {selectedPosition && (
              <>
                <Marker position={selectedPosition} />
                <Circle
                  center={selectedPosition}
                  radius={radius * 1000}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                    weight: 3,
                    dashArray: "10, 5",
                  }}
                />
              </>
            )}

            {/* User location marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;
