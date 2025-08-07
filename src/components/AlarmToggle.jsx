export default function AlarmToggle({ isOn, toggle }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#2563EB] p-4">
        <h3 className="text-white text-sm font-medium">🔔 Alarm Settings</h3>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-gray-800">Sound Alert</p>
              <p className="text-xs text-gray-500">
                Audio notification when inside geofence
              </p>
            </div>
          </div>

          <button
            onClick={toggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ${
              isOn ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                isOn ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="mt-3 text-center">
          <span
            className={`text-sm font-medium ${
              isOn ? "text-green-600" : "text-gray-400"
            }`}
          >
            {isOn ? "🔊 Alarm Enabled" : "🔇 Alarm Disabled"}
          </span>
        </div>
      </div>
    </div>
  );
}
