// src/pages/GeofencePage.jsx
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import MapView from "../components/Mapview";
import LocationInfo from "../components/LocationInfo";
import RadiusControl from "../components/RadiusControl";
import MonitorControls from "../components/MonitorControls";
import AlarmToggle from "../components/AlarmToggle";
import Footer from "../components/Footer";

const GeofencePage = () => {
  /* ──────────────────────────────
     State
  ────────────────────────────── */
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [radius, setRadius] = useState(2); // km
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState("Not Started");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);

  /* ──────────────────────────────
     Refs
  ────────────────────────────── */
  const watchIdRef = useRef(null); // geolocation watcher
  const alarmIntervalRef = useRef(null); // repeating alarm timer
  const audioContextRef = useRef(null); // shared AudioContext

  /* ──────────────────────────────
     Helpers
  ────────────────────────────── */
  // Haversine formula (distance in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6_371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /* ──────────────────────────────
     Alarm system
  ────────────────────────────── */
  // play single 500 ms beep
  const playBeep = async () => {
    try {
      // lazy-create AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
        } catch {
          // Ignore errors
        }
      }, 500);
    } catch (err) {
      console.error("beep error:", err);
    }
  };

  const startAlarm = () => {
    if (alarmIntervalRef.current || !alarmOn) return;
    playBeep();
    alarmIntervalRef.current = setInterval(playBeep, 2_000);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  /* ──────────────────────────────
     Geolocation bootstrap
  ────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Enable location services to use this app."),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  /* ──────────────────────────────
     Monitoring controls
  ────────────────────────────── */
  const startMonitoring = () => {
    if (!selectedPosition) return alert("Select a location on the map first.");
    if (!navigator.geolocation) return alert("Geolocation not supported.");

    setIsMonitoring(true);
    setStatus("Monitoring");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const current = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(current);

        const distance = calculateDistance(
          current[0],
          current[1],
          selectedPosition[0],
          selectedPosition[1]
        );
        const inside = distance <= radius;

        setIsInsideGeofence((prev) => {
          if (prev !== inside) {
            if (inside) {
              setStatus("Inside Geofence");
              if (alarmOn) startAlarm();
            } else {
              setStatus("Outside Geofence");
              stopAlarm();
            }
          }
          return inside;
        });
      },
      (err) => {
        console.error(err);
        setStatus("Error getting location");
        alert("Error retrieving location. Check permissions.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1_000 }
    );
  };

  const stopMonitoring = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsMonitoring(false);
    setStatus("Not Started");
    setIsInsideGeofence(false);
    stopAlarm();
  };

  /* ──────────────────────────────
     Alarm toggle
  ────────────────────────────── */
  const toggleAlarm = () => {
    const next = !alarmOn;
    setAlarmOn(next);
    if (!next) stopAlarm();
    else if (isInsideGeofence && isMonitoring) startAlarm();
  };

  // sync when alarmOn changes (edge cases)
  useEffect(() => {
    if (!alarmOn) stopAlarm();
    else if (isInsideGeofence && isMonitoring) startAlarm();
  }, [alarmOn]);

  /* ──────────────────────────────
     Cleanup on unmount
  ────────────────────────────── */
  useEffect(
    () => () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      stopAlarm();
      audioContextRef.current?.close();
    },
    []
  );

  /* ──────────────────────────────
     UI
  ────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="mx-auto max-w-md min-h-screen bg-white shadow-2xl">
        <Header />

        <div className="p-4 space-y-6">
          <MapView
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            userLocation={userLocation}
            radius={radius}
          />

          <LocationInfo
            selected={
              selectedPosition && {
                lat: selectedPosition[0].toFixed(6),
                lng: selectedPosition[1].toFixed(6),
              }
            }
            current={
              userLocation && {
                lat: userLocation[0].toFixed(6),
                lng: userLocation[1].toFixed(6),
              }
            }
            status={status}
            isInsideGeofence={isInsideGeofence}
          />

          <RadiusControl radius={radius} setRadius={setRadius} />

          <MonitorControls
            isMonitoring={isMonitoring}
            onStart={startMonitoring}
            onStop={stopMonitoring}
            disabled={!selectedPosition}
          />

          <AlarmToggle isOn={alarmOn} toggle={toggleAlarm} />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default GeofencePage;
