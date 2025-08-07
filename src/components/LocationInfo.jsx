export default function LocationInfo({
  selected,
  current,
  status,
  isInsideGeofence,
}) {
  const getStatusColor = () => {
    switch (status) {
      case "Inside Geofence":
        return "text-red-600 bg-red-50 border-red-200";
      case "Outside Geofence":
        return "text-green-600 bg-green-50 border-green-200";
      case "Monitoring":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Inside Geofence":
        return "🚨";
      case "Outside Geofence":
        return "✅";
      case "Monitoring":
        return "👀";
      default:
        return "⭕";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#2563EB] p-4">
        <h3 className="text-white text-sm font-medium">📊 Location Status</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Selected Location */}
        <div className="flex items-center space-x-2">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Selected Location</p>
            {selected ? (
              <p className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                [{selected.lat}, {selected.lng}]
              </p>
            ) : (
              <p className="text-xs text-gray-500 italic">Tap map to select</p>
            )}
          </div>
        </div>

        {/* Current Location */}
        <div className="flex items-center space-x-2">
          <span className="text-xl">📡</span>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Your Location</p>
            {current ? (
              <p className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                [{current.lat}, {current.lng}]
              </p>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Getting location...
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className={`border-2 rounded-lg p-3 ${getStatusColor()}`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <span className="font-semibold text-sm">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
