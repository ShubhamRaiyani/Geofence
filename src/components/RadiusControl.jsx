export default function RadiusControl({ radius, setRadius }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2">
        <h3 className="text-white text-sm font-medium">🎯 Geofence Radius</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Range:</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {radius} km
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={0.5}
            max={50}
            step={0.5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.5 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
