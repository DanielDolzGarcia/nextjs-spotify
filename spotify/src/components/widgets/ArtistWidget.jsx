'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ensureAccessToken } from '@/lib/auth'

export default function ArtistWidget({ selectedItems = [], onSelect, limit = 5 }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [internalSelected, setInternalSelected] = useState(selectedItems)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setInternalSelected(selectedItems)
  }, [selectedItems])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const token = await ensureAccessToken()
      if (!token) {
        setLoading(false)
        return
      }
      const res = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const items = data?.artists?.items || []
      setResults(items)
      setLoading(false)
      setShowResults(true)
    }, 400)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  const toggle = (artist) => {
    const exists = internalSelected.find((a) => a.id === artist.id)
    let next
    if (exists) {
      next = internalSelected.filter((a) => a.id !== artist.id)
    } else {
      if (internalSelected.length >= limit) return
      next = [...internalSelected, artist]
    }
    setInternalSelected(next)
    onSelect?.(next)
    setQuery('')
    setShowResults(false)
  }

  const remove = (artist) => {
    const next = internalSelected.filter((a) => a.id !== artist.id)
    setInternalSelected(next)
    onSelect?.(next)
  }

  return (
    <div className="bg-gray-800 rounded p-4 relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Artistas</h2>
        <span className="text-xs text-gray-400">{internalSelected.length}/{limit}</span>
      </div>
      
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value) setShowResults(true)
          }}
          placeholder="Buscar artista..."
          className="w-full mb-3 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {internalSelected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {internalSelected.map((artist) => {
            const image = artist.images?.[0]?.url || ''
            return (
              <div key={artist.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-white border border-gray-600">
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image src={image || '/vercel.svg'} alt={artist.name} fill sizes="20px" className="rounded-full object-cover" />
                </div>
                <span className="text-sm font-medium">{artist.name}</span>
                <button
                  onClick={() => remove(artist)}
                  className="ml-1 hover:text-red-400 text-gray-400"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((artist) => {
            const image = artist.images?.[0]?.url || ''
            const active = !!internalSelected.find((a) => a.id === artist.id)
            return (
              <button
                key={artist.id}
                onClick={() => toggle(artist)}
                disabled={active}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-700/50 last:border-0 ${active ? 'opacity-50 cursor-not-allowed bg-gray-700/50' : 'hover:bg-gray-700'}`}
              >
                <div className="w-10 h-10 relative flex-shrink-0">
                  <Image src={image || '/vercel.svg'} alt={artist.name} fill sizes="40px" className="rounded-full object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{artist.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{artist.genres?.[0] || 'Artista'}</div>
                </div>
                {!active && (
                  <div className="text-green-500 text-sm font-semibold">
                    + Añadir
                  </div>
                )}
                {active && (
                  <div className="text-gray-400 text-sm">
                    Seleccionado
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
