"use client"

import { useState, useEffect } from 'react';
import { Clock, MapPin, Cloud } from 'lucide-react'; // Using lucide-react icons

interface WeatherData {
  temperature: string;
  description: string;
  // Add more fields as needed from your chosen weather API
}

interface LocationData {
  city: string;
  country: string;
}

const InfoWidget = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Fetch location and weather on mount
  useEffect(() => {
    const fetchLocationAndWeather = async (latitude: number, longitude: number) => {
      // --- Placeholder for Location Geocoding (latitude, longitude -> city/country) ---
      // In a real app, you would use a reverse geocoding API here.
      // For this example, we'll simulate it.
      setLocation({ city: "Current City", country: "Country" });
      console.log(`Simulating reverse geocoding for lat: ${latitude}, lon: ${longitude}`);

      // --- Placeholder for Weather API Fetch ---
      // Replace this with an actual weather API call using latitude and longitude.
      // Example: OpenWeatherMap, WeatherAPI, etc.
      // You will need an API key for most services.
      console.log(`Fetching weather for lat: ${latitude}, lon: ${longitude}`);
      // Simulated weather data:
      setWeather({ temperature: "22°C", description: "Sunny" });
      // try {
      //   const weatherApiKey = 'YOUR_WEATHER_API_KEY'; // Store securely!
      //   const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`);
      //   if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
      //   const data = await weatherResponse.json();
      //   setWeather({
      //     temperature: `${Math.round(data.main.temp)}°C`,
      //     description: data.weather[0]?.description || 'Clear',
      //   });
      //   const city = data.name || 'Unknown City';
      //   const country = data.sys?.country || 'Unknown Country';
      //   setLocation({ city, country });
      // } catch (err) {
      //   console.error("Weather/Location fetch error:", err);
      //   setError("Couldn't load weather/location.");
      //   // Fallback display for weather and location if API fails
      //   setWeather({ temperature: "--°C", description: "Weather N/A" });
      //   setLocation({ city: "Location N/A", country: "" });
      // }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setError(null);
          fetchLocationAndWeather(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          setError('Location access denied or unavailable.');
          // Fallback display for weather and location if geolocation fails
          setWeather({ temperature: "--°C", description: "Weather N/A" });
          setLocation({ city: "Location N/A", country: "" });
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setWeather({ temperature: "--°C", description: "Weather N/A" });
      setLocation({ city: "Location N/A", country: "" });
    }
  }, []);

  return (
    <div className="bg-black/30 backdrop-blur-md text-white p-3 rounded-lg shadow-xl border border-white/20 text-xs space-y-2 min-w-[180px]">
      <div className="flex items-center space-x-2">
        <Clock size={14} className="opacity-80" />
        <span>{currentTime || "--:--"}</span>
      </div>
      <div className="flex items-center space-x-2">
        <MapPin size={14} className="opacity-80" />
        <span>{location ? `${location.city}` : (error || "Loading Location...")}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Cloud size={14} className="opacity-80" />
        <span>{weather ? `${weather.temperature}, ${weather.description}` : (error ? "" : "Loading Weather...")}</span>
      </div>
      {/* {error && <p className=\"text-red-400 text-xxs mt-1\">{error}</p>} */}
    </div>
  );
};

export default InfoWidget; 