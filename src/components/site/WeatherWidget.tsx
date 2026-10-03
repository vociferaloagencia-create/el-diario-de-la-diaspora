"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, MapPin, Droplets, Wind, Loader2 } from "lucide-react";

interface WeatherState {
  location: string;
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  weatherCode: number;
}

function getWeatherDetails(code: number): { condition: string; icon: typeof Sun; color: string } {
  if (code === 0) return { condition: "Despejado", icon: Sun, color: "text-amber-500" };
  if (code >= 1 && code <= 3) return { condition: "Parcialmente Nublado", icon: Cloud, color: "text-slate-400" };
  if (code === 45 || code === 48) return { condition: "Niebla", icon: Cloud, color: "text-slate-400" };
  if (code >= 51 && code <= 67) return { condition: "Lluvia", icon: CloudRain, color: "text-blue-500" };
  if (code >= 71 && code <= 77) return { condition: "Nieve", icon: CloudSnow, color: "text-sky-300" };
  if (code >= 80 && code <= 82) return { condition: "Chubascos", icon: CloudRain, color: "text-blue-600" };
  if (code >= 95) return { condition: "Tormenta Eléctrica", icon: CloudLightning, color: "text-amber-600" };
  return { condition: "Mayormente Despejado", icon: Sun, color: "text-amber-400" };
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWeatherForCoords(lat: number, lon: number, cityName: string) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fallo al obtener clima");
        const data = await res.json();

        const current = data.current;
        if (isMounted && current) {
          const weatherObj: WeatherState = {
            location: cityName,
            temperature: Math.round(current.temperature_2m),
            condition: getWeatherDetails(current.weather_code).condition,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            weatherCode: current.weather_code,
          };
          setWeather(weatherObj);
          try {
            sessionStorage.setItem("diaspora_weather", JSON.stringify(weatherObj));
          } catch {}
        }
      } catch (err) {
        console.error("Error Open-Meteo:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function resolveLocationAndWeather() {
      // 1. Chequear caché de sesión para evitar peticiones repetitivas
      try {
        const cached = sessionStorage.getItem("diaspora_weather");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.location && typeof parsed?.temperature === "number") {
            setWeather(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Intentar geolocalización por IP como base segura inmediata
      let lat = 18.4861;
      let lon = -69.9312;
      let city = "Santo Domingo";

      try {
        const ipRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            lat = ipData.latitude;
            lon = ipData.longitude;
            city = ipData.city || ipData.region || "Tu Ubicación";
          }
        }
      } catch {
        // Fallback secundario si ipapi tuviera rate limit
        try {
          const fallbackRes = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(2500) });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            if (fbData.latitude && fbData.longitude) {
              lat = fbData.latitude;
              lon = fbData.longitude;
              city = fbData.cityName || "Tu Ubicación";
            }
          }
        } catch {}
      }

      // 3. Si el usuario tiene GPS activo y lo permite, refinar coordenadas
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude, city);
          },
          () => {
            fetchWeatherForCoords(lat, lon, city);
          },
          { timeout: 3000, maximumAge: 600000 }
        );
      } else {
        fetchWeatherForCoords(lat, lon, city);
      }
    }

    resolveLocationAndWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[140px]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Sincronizando el tiempo...
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const details = getWeatherDetails(weather.weatherCode);
  const IconComponent = details.icon;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{weather.location}</span>
        </div>
        <span className="text-[10px] font-mono bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full">
          En vivo
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-4xl font-extrabold tracking-tight font-headline flex items-start">
            {weather.temperature}
            <span className="text-2xl font-light text-slate-400 ml-0.5">°C</span>
          </div>
          <p className="text-xs font-medium text-slate-300 mt-1">
            {details.condition}
          </p>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <IconComponent className={`h-10 w-10 ${details.color} drop-shadow-md`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        {weather.humidity !== undefined && (
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>Humedad: {weather.humidity}%</span>
          </div>
        )}
        {weather.windSpeed !== undefined && (
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span>Viento: {weather.windSpeed} km/h</span>
          </div>
        )}
      </div>
    </div>
  );
}
