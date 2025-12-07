'use client'

import { useState, useRef, useEffect } from 'react'

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

  // Referencia al contenedor del slider para cálculos de posición
  const sliderRef = useRef(null)
  const [dragging, setDragging] = useState(null) // 'min' | 'max' | null
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Efecto para gestionar el arrastre global (pointermove/pointerup)
  useEffect(() => {
    if (!dragging) return

    const handlePointerMove = (e) => {
      if (!sliderRef.current) return
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
      const value = Math.round(percentage)

      if (dragging === 'min') {
        const newValue = Math.min(value, max)
        if (newValue !== min) {
          setMin(newValue)
          onSelect?.([newValue, max])
        }
      } else {
        const newValue = Math.max(value, min)
        if (newValue !== max) {
          setMax(newValue)
          onSelect?.([min, newValue])
        }
      }
    }

    const handlePointerUp = () => {
      setDragging(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragging, min, max, onSelect])

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
      
      <div className="pt-2 border-t border-gray-700">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2"
        >
          {showAdvanced ? 'Ocultar avanzado' : 'Avanzado'} {showAdvanced ? '▲' : '▼'}
        </button>
        
        {showAdvanced && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-900/50 p-4 rounded mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{min}%</span>
              <span>{max}%</span>
            </div>
            
            <div 
              className="relative h-6 w-full cursor-pointer touch-none"
              ref={sliderRef}
              onPointerDown={(e) => {
                // Determinar qué thumb está más cerca para iniciar arrastre inmediato si se pulsa la barra
                if (!sliderRef.current) return
                const rect = sliderRef.current.getBoundingClientRect()
                const p = ((e.clientX - rect.left) / rect.width) * 100
                const distMin = Math.abs(p - min)
                const distMax = Math.abs(p - max)
                setDragging(distMin < distMax ? 'min' : 'max')
              }}
            >
              {/* Pista de fondo */}
              <div className="absolute top-2.5 left-0 w-full h-1 bg-gray-700 rounded-full"></div>
              
              {/* Rango seleccionado */}
              <div 
                className="absolute top-2.5 h-1 bg-green-500 rounded-full pointer-events-none"
                style={{ left: `${min}%`, width: `${max - min}%` }}
              ></div>

              {/* Thumb visual Mínimo */}
              <div 
                className={`absolute top-0 w-6 h-6 bg-white border-2 border-green-500 rounded-full shadow z-10 transition-transform ${dragging === 'min' ? 'scale-110' : ''}`}
                style={{ left: `calc(${min}% - 12px)` }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setDragging('min')
                }}
              ></div>

              {/* Thumb visual Máximo */}
              <div 
                className={`absolute top-0 w-6 h-6 bg-white border-2 border-green-500 rounded-full shadow z-10 transition-transform ${dragging === 'max' ? 'scale-110' : ''}`}
                style={{ left: `calc(${max}% - 12px)` }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setDragging('max')
                }}
              ></div>
            </div>

            {/* Inputs manuales debajo para precisión */}
            <div className="flex justify-between gap-4 mt-4">
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] text-gray-400">Mín</label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={min} 
                  onChange={(e) => updateMin(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center focus:border-green-500 outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1 w-20">
                <label className="text-[10px] text-gray-400">Máx</label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={max} 
                  onChange={(e) => updateMax(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-center focus:border-green-500 outline-none" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
