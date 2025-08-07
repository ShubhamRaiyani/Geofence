export default function MonitorControls({
  isMonitoring,
  onStart,
  onStop,
  disabled,
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#2563EB] p-4">
        <h3 className="text-white text-sm font-medium">
          🎮 Monitoring Controls
        </h3>
      </div>

      <div className="p-6 text-center">
        {!isMonitoring ? (
          <button
            onClick={onStart}
            disabled={disabled}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform ${
              disabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
            }`}
          >
            {disabled ? (
              <span>🚫 Select Location First</span>
            ) : (
              <span>▶️ Start Monitoring</span>
            )}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            ⏹ Stop Monitoring
          </button>
        )}

        {isMonitoring && (
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">
              Live Tracking Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
