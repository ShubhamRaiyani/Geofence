export default function Footer() {
  return (
    <footer className="bg-gray-800 text-center py-6 text-white">
      <div className="space-y-2">
        <p className="text-sm">Made with ❤️</p>
        <div className="flex justify-center space-x-4 text-xs text-gray-400">
          <span>🗺️ OpenStreetMap</span>
          <span>📱 React</span>
          <span>🎨 Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
