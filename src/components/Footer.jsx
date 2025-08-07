export default function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-center py-6 text-white select-none px-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Explanation at the top of footer */}
        <section className="bg-[#274080] p-4 rounded-md shadow-md">
          <h3 className="text-lg font-semibold mb-2">What This Website Does</h3>
          <p className="text-sm leading-relaxed">
            This website lets you set up a <strong>Geofence</strong> — a virtual
            boundary on the map — by selecting a location and radius. When you
            enter this area, the app alerts you with an alarm. It saves your
            settings and respects your privacy by processing data locally.
          </p>
        </section>

        {/* Original footer content */}
        <p className="text-sm">
          © 2025 Geofence Alarm Tracker. All rights reserved.
        </p>

        <p className="text-sm">
          Contact us:{" "}
          <a
            href="mailto:support@geofenceapp.com"
            className="underline hover:text-gray-300"
          >
            shubhamraiyani@proton.me
          </a>
        </p>

        <p className="text-xs text-gray-300 max-w-xs mx-auto">
          We respect your privacy. Location data is processed locally and
          securely.
        </p>

        <p className="italic text-gray-400 text-xs">
          Version 1.0 — Updated August 2025
        </p>

        <p className="text-sm">Made with ❤️ by Shubham Raiyani</p>

        {/* <div className="flex justify-center space-x-4 text-xs text-gray-300 mt-3">
          <span>🗺️ OpenStreetMap</span>
          <span>📱 React</span>
          <span>🎨 Tailwind CSS</span>
        </div> */}
      </div>
    </footer>
  );
}
