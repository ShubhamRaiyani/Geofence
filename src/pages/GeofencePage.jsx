import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import MapView from "../components/Mapview";
import LocationInfo from "../components/LocationInfo";
import RadiusControl from "../components/RadiusControl";
import MonitorControls from "../components/MonitorControls";
import AlarmToggle from "../components/AlarmToggle";
import Footer from "../components/Footer";

export default function GeofencePage() {
  // State with localStorage initialization
  const [selectedPosition, setSelectedPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedPosition");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [radius, setRadius] = useState(() => {
    try {
      const saved = localStorage.getItem("radius");
      return saved ? Number(saved) : 2;
    } catch {
      return 2;
    }
  });
  const [alarmOn, setAlarmOn] = useState(() => {
    try {
      const saved = localStorage.getItem("alarmOn");
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState("Not Started");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);

  // Friendly alert message state
  const [alertMessage, setAlertMessage] = useState(null);

  // Refs for geolocation watcher, alarm timer, audio context
  const watchIdRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Haversine distance calculation (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Save selectedPosition to localStorage
  useEffect(() => {
    if (selectedPosition) {
      try {
        localStorage.setItem(
          "selectedPosition",
          JSON.stringify(selectedPosition)
        );
      } catch {}
    }
  }, [selectedPosition]);

  // Save radius to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("radius", radius.toString());
    } catch {}
  }, [radius]);

  // Save alarmOn to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("alarmOn", JSON.stringify(alarmOn));
    } catch {}
  }, [alarmOn]);

  // Play a 500ms beep sound with Web Audio API
  const playBeep = async () => {
    try {
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
        } catch {}
      }, 500);
    } catch (err) {
      console.error("beep error:", err);
    }
  };

  // Start the alarm repeating every 2 seconds
  const startAlarm = () => {
    if (alarmIntervalRef.current || !alarmOn) return;
    playBeep();
    alarmIntervalRef.current = setInterval(playBeep, 2000);
  };

  // Stop the alarm
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Helper to show alert message:
  // If type="alert", shows native alert box and clears inline message.
  // Otherwise shows inline alert banner.
  const showAlertMessage = (message) => {
    if (message.type === "alert") {
      window.alert(
        typeof message.text === "string" ? message.text : String(message.text)
      );
      setAlertMessage(null);
    } else {
      setAlertMessage(message);
    }
  };

  // Initial geolocation request with friendly messaging and sessionStorage flag to avoid repeat alerts
  useEffect(() => {
    if (!navigator.geolocation) {
      showAlertMessage({
        type: "error",
        text: "Geolocation is not supported by your browser. This app needs access to your location to work properly.",
      });
      return;
    }

    const locationDeniedShown = sessionStorage.getItem("locationDeniedShown");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        showAlertMessage({
          type: "info",
          text: "Hey! We just need your location to make sure the geofence works — but don’t worry, your location never leaves your browser and we don't own any database for it.",
        });
        setTimeout(() => setAlertMessage(null), 12000);
        // Clear the flag on success so alert could show again if denied later
        sessionStorage.removeItem("locationDeniedShown");
      },
      () => {
        if (!locationDeniedShown) {
          showAlertMessage({
            type: "alert",
            text: "Please enable location services in your browser so this app can track your position. We promise we don't save or share your location — it stays only on your device.",
          });
          sessionStorage.setItem("locationDeniedShown", "true");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Start monitoring with transparency message
  const startMonitoring = () => {
    if (!selectedPosition) {
      showAlertMessage({
        type: "warning",
        text: "Pick a spot on the map before starting monitoring! We’ll keep your location only on this browser and we don't own any databases for it.",
      });
      return;
    }
    if (!navigator.geolocation) {
      showAlertMessage({
        type: "error",
        text: "Your browser doesn’t support geolocation, so we can’t monitor location.",
      });
      return;
    }

    setIsMonitoring(true);
    setStatus("Monitoring");
    showAlertMessage({
      type: "success",
      text: "Monitoring started! Your location tracking happens only on your device — private and secure.",
    });

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
              showAlertMessage({
                type: "info",
                text: "You’re inside the geofence now! Alarm will sound if enabled.",
              });
            } else {
              setStatus("Outside Geofence");
              stopAlarm();
              showAlertMessage({
                type: "info",
                text: "You moved outside the geofence — alarm stopped.",
              });
            }
          }
          return inside;
        });
      },
      (err) => {
        console.error(err);
        setStatus("Error getting location");
        showAlertMessage({
          type: "error",
          text: "Oops! We’re having trouble getting your location. Please check browser permissions and try again.",
        });
        stopMonitoring();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsMonitoring(false);
    setStatus("Not Started");
    setIsInsideGeofence(false);
    stopAlarm();
    showAlertMessage({
      type: "info",
      text: "Monitoring stopped. You can start again anytime.",
    });
  };

  // Toggle alarm and show transparency messages
  const toggleAlarm = () => {
    const next = !alarmOn;
    setAlarmOn(next);
    if (!next) {
      stopAlarm();
      showAlertMessage({
        type: "info",
        text: "Alarm turned off. You won’t hear any alerts even if inside geofence.",
      });
    } else if (isInsideGeofence && isMonitoring) {
      startAlarm();
      showAlertMessage({
        type: "info",
        text: "Alarm turned on. You’ll hear alerts when inside the geofence.",
      });
    }
  };

  // Sync alarm on state change
  useEffect(() => {
    if (!alarmOn) stopAlarm();
    else if (isInsideGeofence && isMonitoring) startAlarm();
  }, [alarmOn, isInsideGeofence, isMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      stopAlarm();
      audioContextRef.current?.close();
    };
  }, []);

  // Inline alert banner component
  const AlertBanner = ({ message }) => {
    if (!message) return null;

    let bgColor = "bg-blue-100 text-blue-900";
    if (message.type === "error") bgColor = "bg-red-100 text-red-900";
    else if (message.type === "warning")
      bgColor = "bg-yellow-100 text-yellow-900";
    else if (message.type === "success")
      bgColor = "bg-green-100 text-green-900";

    return (
      <div
        role="alert"
        className={`${bgColor} border rounded-md p-3 mb-4 max-w-md mx-auto text-center select-text`}
        style={{ whiteSpace: "pre-line" }}
      >
        {message.text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="mx-auto max-w-md min-h-screen bg-[#E6F0FA] shadow-2xl">
        <Header />

        <div className="p-4 space-y-6">
          {/* Show inline alert if any and NOT of type 'alert' */}
          {alertMessage && alertMessage.type !== "alert" && (
            <AlertBanner message={alertMessage} />
          )}

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
}
