'use client'

import { useState } from 'react'

const MOOD_PRESETS = [
  { 
    id: 'happy', 
    label: 'Feliz ☀️', 
    params: { min_valence: 0.7, min_energy: 0.6 }
  },
  { 
    id: 'sad', 
    label: 'Triste 🌧️', 
    params: { max_valence: 0.4, max_energy: 0.4 }
  },
  { 
    id: 'energetic', 
    label: 'Energético ⚡', 
    params: { min_energy: 0.8, min_danceability: 0.6 }
  },
  { 
    id: 'calm', 
    label: 'Chill 🧘', 
    params: { max_energy: 0.3, max_tempo: 100 }
  },
  { 
    id: 'party', 
    label: 'Fiesta 🎉', 
    params: { min_danceability: 0.8, min_energy: 0.7 }
  },
  { 
    id: 'focus', 
    label: 'Enfoque 🧠', 
    params: { max_speechiness: 0.3, min_instrumentalness: 0.5 }
  }
]

export default function MoodWidget({ selectedItems = {}, onSelect }) {
  // Derivar el mood activo directamente de las props
  const activeMood = (() => {
    if (!selectedItems || Object.keys(selectedItems).length === 0) return null
    return MOOD_PRESETS.find(p => {
      const pKeys = Object.keys(p.params)
      return pKeys.every(k => selectedItems[k] === p.params[k])
    })?.id || null
  })()

  const toggleMood = (mood) => {
    if (activeMood === mood.id) {
      onSelect?.({})
    } else {
      onSelect?.(mood.params)
    }
  }

  return (
    <div className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Mood & Energía</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {MOOD_PRESETS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => toggleMood(mood)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeMood === mood.id
                ? 'bg-green-600 border-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>
      
      {activeMood && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          Filtros aplicados: {
            Object.entries(MOOD_PRESETS.find(m => m.id === activeMood)?.params || {})
              .map(([k, v]) => `${k.replace('min_', 'Mín ').replace('max_', 'Máx ')}: ${v}`)
              .join(' • ')
          }
        </div>
      )}
    </div>
  )
}
