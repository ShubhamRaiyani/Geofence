# Geofence

A React and Tailwind CSS geofencing application that lets you draw a circular area on an interactive map and receive notifications when you enter that area. Geofence uses Leaflet.js for maps and the browser’s Geolocation API to track your location in real time. All data is stored in the browser (no backend needed).

## Features

- 🗺️ **Interactive Map** – Rendered with Leaflet.js; click or draw on the map to define a circular geofence.
- 🎯 **Define Geofence** – Draw a circle on the map; the geofence coordinates are saved in the browser’s localStorage.
- 📍 **Real-time Tracking** – Continuously tracks the user’s current position using the browser’s Geolocation API.
- 🔍 **Inside/Outside Detection** – The app constantly checks whether the user is inside or outside the drawn geofence.
- 🔔 **Alarm Notification** – Plays an audio alert when the user enters the geofenced area.
- 💾 **Local Storage** – Geofence data persists in localStorage, so your fence is remembered on page reload.
- 🖥️ **Client-side Only** – Entirely front-end; no server or database required (runs completely in your browser).

## Tech Stack

- **React** – A JavaScript library for building user interfaces [React](https://react.dev/).
- **Tailwind CSS** – A utility-first CSS framework for styling the UI [Tailwind CSS](https://tailwindcss.com/).
- **Leaflet.js** – An open-source JavaScript library for interactive maps [Leaflet.js](https://leafletjs.com/).
- **React Leaflet** – React components that make it easy to use Leaflet maps in React.
- **Geolocation API** – Browser API that provides the user’s location to web apps [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
- **LocalStorage** – Web Storage API for saving the geofence data on the client side.
- **JavaScript/HTML/CSS** – Core web technologies.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShubhamRaiyani/Geofence.git
   cd Geofence
2. **Install dependencies:**
   ```bash
   npm install
3. **Run the app:**
   ```bash
   npm start

This starts the development server (e.g. on http://localhost:3000). Make sure you have Node.js installed.

## Usage

1. **Open the app**: After running `npm start`, the app will open in your browser.
2. **Draw a geofence**: Click on the map to draw a circular area. This defines the geofence boundary (the coordinates are automatically saved in localStorage).
3. **Allow location access**: Your browser will prompt you to allow location access. Grant permission so the app can track your position [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
4. **Monitor position**: The app will show your current location on the map.
5. **Geofence alert**: As you move (or simulate movement), the app will detect if you enter the geofence. An alarm sound will play when you are inside the defined area.

📂 File Structure
```bash
Geofence/
├── public/
│   └── index.html         # Static HTML file
├── src/
│   ├── components/        # Reusable React components
│   ├── App.js             # Main React component
│   ├── index.js           # Entry point
│   └── ...                # Other source files
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Project metadata and scripts
└── README.md
```

##Screenshot

![Preview of the Geofence application interface.](path/to/screenshot.png)

(Replace the image path with your actual screenshot path.)

## Permissions

This app requires location access to function. Your browser will ask for permission to use your location (via the Geolocation API) when the app loads [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). Ensure that location services are enabled in your browser or device settings.

## License

This project is released under the MIT License.

## Author

Shubham Raiyani – Creator of Geofence.

## Screenshot

![Preview of the Geofence application interface.](path/to/screenshot.png)

(Replace the image path with your actual screenshot path.)

## Permissions

This app requires location access to function. Your browser will ask for permission to use your location (via the Geolocation API) when the app loads [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). Ensure that location services are enabled in your browser or device settings.

## License

This project is released under the MIT License.

## Author

Shubham Raiyani – Creator of Geofence.

