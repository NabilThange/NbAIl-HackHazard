"use client"

import React from 'react'
import { Clock, MapPin, CloudSun } from 'lucide-react'

export default function InfoWidget() {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentCity = "San Francisco"; // This could be dynamically fetched
  const temperature = "22°C";
  const weatherCondition = "Sunny";

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
        <Clock className="w-4 h-4" />
        <span>{currentTime}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
        <MapPin className="w-4 h-4" />
        <span>{currentCity}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
        <CloudSun className="w-4 h-4" />
        <span>{temperature} {weatherCondition}</span>
      </div>
    </div>
  )
} 