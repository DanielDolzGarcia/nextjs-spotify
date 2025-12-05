'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ensureAccessToken } from '@/lib/auth'

export default function ArtistWidget({ selectedItems = [], onSelect, limit = 5 }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [internalSelected, setInternalSelected] = useState(selectedItems)
  const timerRef = useRef(null)

  useEffect(() => {
    setInternalSelected(selectedItems)
  }, [selectedItems])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
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
  }

  return (
    <div className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Artistas</h2>
        <span className="text-xs text-gray-400">{internalSelected.length}/{limit}</span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar artista"
        className="w-full mb-3 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
      />
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((artist) => {
            const image = artist.images?.[0]?.url || ''
            const active = !!internalSelected.find((a) => a.id === artist.id)
            return (
              <button
                key={artist.id}
                onClick={() => toggle(artist)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded border ${active ? 'bg-green-600 border-green-500 text-black' : 'bg-gray-700 border-gray-600 text-white'} hover:opacity-90`}
              >
                <div className="w-8 h-8 relative">
                  <Image src={image || '/vercel.svg'} alt={artist.name} fill sizes="32px" className="rounded object-cover" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{artist.name}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

