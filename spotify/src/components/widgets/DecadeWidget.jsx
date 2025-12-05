'use client'

import { useMemo, useState, useEffect } from 'react'

const DECADES = ['1950','1960','1970','1980','1990','2000','2010','2020']

export default function DecadeWidget({ selectedItems = [], onSelect, limit = 6 }) {
  const [internalSelected, setInternalSelected] = useState(selectedItems)

  useEffect(() => {
    setInternalSelected(selectedItems)
  }, [selectedItems])

  const toggle = (decade) => {
    const exists = internalSelected.includes(decade)
    let next
    if (exists) {
      next = internalSelected.filter(d => d !== decade)
    } else {
      if (internalSelected.length >= limit) return
      next = [...internalSelected, decade]
    }
    setInternalSelected(next)
    onSelect?.(next)
  }

  const chips = useMemo(() => DECADES, [])

  return (
    <div className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Décadas</h2>
        <span className="text-xs text-gray-400">{internalSelected.length}/{limit}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((decade) => {
          const active = internalSelected.includes(decade)
          return (
            <button
              key={decade}
              onClick={() => toggle(decade)}
              className={`px-3 py-1 rounded text-sm border ${active ? 'bg-green-600 border-green-500 text-black' : 'bg-gray-700 border-gray-600 text-white'} hover:opacity-90`}
            >
              {decade}s
            </button>
          )
        })}
      </div>
    </div>
  )
}

