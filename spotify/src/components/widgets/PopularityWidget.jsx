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

  const label = () => {
    if (min >= 80) return 'Mainstream'
    if (min >= 50) return 'Popular'
    return 'Underground'
  }

  return (
    <div key={propsKey} className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Popularidad</h2>
        <span className="text-xs text-gray-400">{min}-{max} · {label()}</span>
      </div>
      <div className="space-y-3">
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
