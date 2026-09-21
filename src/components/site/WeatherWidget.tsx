"use client";

import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Loader2 } from 'lucide-react';

interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    icon: React.ReactNode;
}

const fakeWeatherConditions = [
    { temperature: 29, condition: 'Parcialmente Nublado', icon: <Cloud className="!text-6xl text-slate-400" /> },
    { temperature: 31, condition: 'Soleado', icon: <Sun className="!text-6xl text-amber-400" /> },
    { temperature: 27, condition: 'Lluvia Ligera', icon: <CloudRain className="!text-6xl text-blue-400" /> },
    { temperature: 28, condition: 'Mayormente Nublado', icon: <Cloud className="!text-6xl text-slate-500" /> },
    { temperature: 30, condition: 'Despejado', icon: <Sun className="!text-6xl text-amber-400" /> },
];

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading and then pick a random weather condition
        const timer = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * fakeWeatherConditions.length);
            const randomCondition = fakeWeatherConditions[randomIndex];
            
            setWeather({
                location: 'Santo Domingo',
                ...randomCondition
            });

            setLoading(false);
        }, 500); // Short delay to simulate fetching

        return () => clearTimeout(timer);
    }, []);


    if (loading) {
        return (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[160px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (!weather) return null;

    return (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900">
            <h3 className="text-lg font-bold mb-4">El Tiempo</h3>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg">{weather.location}</p>
                    <p className="text-4xl font-bold">{weather.temperature}°C</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{weather.condition}</p>
                </div>
                <div className="text-6xl">
                    {weather.icon}
                </div>
            </div>
        </div>
    );
}
