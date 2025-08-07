import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import MapView from "../components/Mapview";
import LocationInfo from "../components/LocationInfo";
import RadiusControl from "../components/RadiusControl";
import MonitorControls from "../components/MonitorControls";
import AlarmToggle from "../components/AlarmToggle";
import Footer from "../components/Footer";

const GeofencePage = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [radius, setRadius] = useState(2);
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState("Not Started");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);

  const audioRef = useRef(null);
  const watchIdRef = useRef(null);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Create alarm sound using Web Audio API
  const createAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
      }, 500);
    } catch (error) {
      console.error("Error creating alarm sound:", error);
    }
  };

  // Play alarm sound
  const playAlarm = () => {
    if (alarmOn && isInsideGeofence) {
      createAlarmSound();
      setTimeout(() => {
        if (isInsideGeofence && alarmOn) {
          playAlarm();
        }
      }, 2000);
    }
  };

  // Track user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location services to use this app.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Start monitoring user location
  const startMonitoring = () => {
    if (!selectedPosition) {
      alert("Please select a location on the map first!");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsMonitoring(true);
    setStatus("Monitoring");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userCoords = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(userCoords);

        const distance = calculateDistance(
          userCoords[0],
          userCoords[1],
          selectedPosition[0],
          selectedPosition[1]
        );

        const wasInside = isInsideGeofence;
        const isInside = distance <= radius;
        setIsInsideGeofence(isInside);

        if (isInside && !wasInside) {
          setStatus("Inside Geofence");
          playAlarm();
        } else if (!isInside && wasInside) {
          setStatus("Outside Geofence");
        } else if (isInside) {
          setStatus("Inside Geofence");
        } else {
          setStatus("Outside Geofence");
        }
      },
      (error) => {
        console.error("Error watching location:", error);
        setStatus("Error getting location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
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
  };

  // Toggle alarm
  const toggleAlarm = () => {
    setAlarmOn(!alarmOn);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen">
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
              selectedPosition
                ? {
                    lat: selectedPosition[0].toFixed(6),
                    lng: selectedPosition[1].toFixed(6),
                  }
                : null
            }
            current={
              userLocation
                ? {
                    lat: userLocation[0].toFixed(6),
                    lng: userLocation[1].toFixed(6),
                  }
                : null
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
