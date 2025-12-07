'use client'

import { useState } from 'react'

export default function PopularityWidget({ selectedItems = [30, 100], onSelect }) {
  const [min, setMin] = useState(selectedItems[0] ?? 30)
  const [max, setMax] = useState(selectedItems[1] ?? 100)
  const propsKey = `${selectedItems[0]}-${selectedItems[1]}`

  const syncFromProps = () => {
    const [smin, smax] = selectedItems
    if (typeof smin === 'number' && smin !== min) setMin(smin)
    if (typeof smax === 'number' && smax !== max) setMax(smax)
  }

  const updateMin = (value) => {
    const v = Math.max(0, Math.min(100, Number(value)))
    const nv = Math.min(v, max)
    setMin(nv)
    onSelect?.([nv, max])
  }

  const updateMax = (value) => {
    const v = Math.max(0, Math.min(100, Number(value)))
    const nv = Math.max(v, min)
    setMax(nv)
    onSelect?.([min, nv])
  }

  const PRESETS = [
    { label: 'Viral 🔥', min: 80, max: 100 },
    { label: 'Hits 💿', min: 50, max: 80 },
    { label: 'Nicho 🕵️', min: 0, max: 40 },
    { label: 'Todo 🌍', min: 0, max: 100 }
  ]

  const setPreset = (preset) => {
    setMin(preset.min)
    setMax(preset.max)
    onSelect?.([preset.min, preset.max])
  }

  const isPresetActive = (p) => p.min === min && p.max === max

  const label = () => {
    if (min >= 80) return 'Viral'
    if (min >= 50) return 'Hits'
    return 'Nicho'
  }

  return (
    <div key={propsKey} className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Popularidad</h2>
        <span className="text-xs text-gray-400">{min}-{max} · {label()}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => setPreset(preset)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              isPresetActive(preset)
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Ajuste manual</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 w-20">Mín.</span>
          <input type="range" min={0} max={100} value={min} onChange={(e) => updateMin(e.target.value)} className="flex-1" />
          <input type="number" min={0} max={100} value={min} onChange={(e) => updateMin(e.target.value)} className="w-16 bg-gray-700 text-white px-2 py-1 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 w-20">Máx.</span>
          <input type="range" min={0} max={100} value={max} onChange={(e) => updateMax(e.target.value)} className="flex-1" />
          <input type="number" min={0} max={100} value={max} onChange={(e) => updateMax(e.target.value)} className="w-16 bg-gray-700 text-white px-2 py-1 rounded" />
        </div>
      </div>
    </div>
  )
}
