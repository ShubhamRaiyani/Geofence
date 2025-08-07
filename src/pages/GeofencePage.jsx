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

  // For showing friendly alert messages with transparency text
  const [alertMessage, setAlertMessage] = useState(null);

  // Refs
  const watchIdRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Haversine formula (distance in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Save to localStorage on selectedPosition change
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

  // Save radius
  useEffect(() => {
    try {
      localStorage.setItem("radius", radius.toString());
    } catch {}
  }, [radius]);

  // Save alarmOn
  useEffect(() => {
    try {
      localStorage.setItem("alarmOn", JSON.stringify(alarmOn));
    } catch {}
  }, [alarmOn]);

  // Play a beep sound
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

  const startAlarm = () => {
    if (alarmIntervalRef.current || !alarmOn) return;
    playBeep();
    alarmIntervalRef.current = setInterval(playBeep, 2000);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Initial geolocation getCurrentPosition with transparency alert
  useEffect(() => {
    if (!navigator.geolocation) {
      setAlertMessage({
        type: "error",
        text: "Geolocation is not supported by your browser. This app needs access to your location to work properly.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        // Friendly transparency message about location usage:
        setAlertMessage({
          type: "info",
          text: "Hey! We just need your location to make sure the geofence works — but don’t worry, your location never leaves your browser and we don't own any database for it.",
        });
        setTimeout(() => setAlertMessage(null), 12000); // auto dismiss after 12s
      },
      () => {
        setAlertMessage({
          type: "warning",
          text: (
            <>
              Please enable location services in your browser so this app can
              track your position. We promise we don’t save or share your
              location — it stays only on your device.
            </>
          ),
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Start monitoring with alert & transparency message
  const startMonitoring = () => {
    if (!selectedPosition) {
      setAlertMessage({
        type: "warning",
        text: "Pick a spot on the map before starting monitoring! We’ll keep your location only on this browser we are earning to own databases from this.",
      });
      return;
    }
    if (!navigator.geolocation) {
      setAlertMessage({
        type: "error",
        text: "Your browser doesn’t support geolocation, so we can’t monitor location.",
      });
      return;
    }

    setIsMonitoring(true);
    setStatus("Monitoring");
    setAlertMessage({
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
              setAlertMessage({
                type: "info",
                text: "You’re inside the geofence now! Alarm will sound if enabled.",
              });
            } else {
              setStatus("Outside Geofence");
              stopAlarm();
              setAlertMessage({
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
        setAlertMessage({
          type: "error",
          text: "Oops! We’re having trouble getting your location. Please check browser permissions and try again.",
        });
        stopMonitoring();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
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
    setAlertMessage({
      type: "info",
      text: "Monitoring stopped. You can start again anytime.",
    });
  };

  // Toggle alarm with transparency message
  const toggleAlarm = () => {
    const next = !alarmOn;
    setAlarmOn(next);
    if (!next) {
      stopAlarm();
      setAlertMessage({
        type: "info",
        text: "Alarm turned off. You won’t hear any alerts even if inside geofence.",
      });
    } else if (isInsideGeofence && isMonitoring) {
      startAlarm();
      setAlertMessage({
        type: "info",
        text: "Alarm turned on. You’ll hear alerts when inside the geofence.",
      });
    }
  };

  // Sync alarm state on changes
  useEffect(() => {
    if (!alarmOn) stopAlarm();
    else if (isInsideGeofence && isMonitoring) startAlarm();
  }, [alarmOn, isInsideGeofence, isMonitoring]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      stopAlarm();
      audioContextRef.current?.close();
    };
  }, []);

  // Alert banner UI (colored based on type)
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
          {/* Friendly transparent alert messages here */}
          <AlertBanner message={alertMessage} />

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
