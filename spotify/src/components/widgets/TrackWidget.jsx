'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getAccessToken } from '@/lib/auth'

export default function TrackWidget({ onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef(null)

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
    const searchTracks = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const token = getAccessToken()
        if (!token) return

        const res = await fetch(
          `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await res.json()
        setResults(data.tracks?.items || [])
        setShowResults(true)
      } catch (error) {
        console.error('Error searching tracks:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      searchTracks()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleAdd = (track) => {
    onAdd(track)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative w-full mb-6" ref={containerRef}>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value) setShowResults(true)
          }}
          placeholder="🔍 Añadir canción a la playlist..."
          className="w-full px-4 py-3 rounded-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((track) => {
            const rawImage = track.album?.images?.[0]?.url || ''
            const image = rawImage?.startsWith('https://iscdn.co/')
                ? rawImage.replace('https://iscdn.co/', 'https://i.scdn.co/')
                : rawImage
            
            return (
              <button
                key={track.id}
                onClick={() => handleAdd(track)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
              >
                <div className="w-10 h-10 relative flex-shrink-0">
                  <Image
                    src={image || '/vercel.svg'}
                    alt={track.name}
                    fill
                    sizes="40px"
                    className="rounded object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate text-white">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artists.map((a) => a.name).join(', ')}
                  </div>
                </div>
                <div className="text-green-500 text-sm font-semibold">
                  + Añadir
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
