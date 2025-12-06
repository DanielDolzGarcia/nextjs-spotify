'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout, ensureAccessToken } from '@/lib/auth'
import { generatePlaylist } from '@/lib/spotify'
import GenreWidget from '@/components/widgets/GenreWidget'
import PopularityWidget from '@/components/widgets/PopularityWidget'
import DecadeWidget from '@/components/widgets/DecadeWidget'
import ArtistWidget from '@/components/widgets/ArtistWidget'
import TrackCard from '@/components/TrackCard'

export default function DashboardPage() {
  const router = useRouter()
  const [genres, setGenres] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('favorite_tracks') || '[]')
  })
  const [popularity, setPopularity] = useState([30, 100])
  const [decades, setDecades] = useState([])
  const [artists, setArtists] = useState([])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/')
      return
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  const toggleFavorite = (track) => {
    const favoritesList = JSON.parse(localStorage.getItem('favorite_tracks') || '[]')
    const exists = favoritesList.find((f) => f.id === track.id)
    let updated
    if (exists) {
      updated = favoritesList.filter((f) => f.id !== track.id)
    } else {
      updated = [...favoritesList, track]
    }
    localStorage.setItem('favorite_tracks', JSON.stringify(updated))
    setFavorites(updated)
  }

  const removeTrack = (trackId) => {
    setPlaylist((pl) => pl.filter((t) => t.id !== trackId))
  }

  const buildPreferences = () => ({
    artists,
    genres,
    decades,
    popularity
  })

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      setError('')
      const token = await ensureAccessToken()
      if (!token) {
        setError('No hay token de acceso. Inicia sesión nuevamente.')
        return
      }
      const prefs = buildPreferences()
      const tracks = await generatePlaylist(prefs)
      const list = tracks || []
      setPlaylist(list)
      setNotFound(list.length === 0)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    if (loading) return
    await generate()
  }

  const addMore = async () => {
    if (loading) return
    setLoading(true)
    try {
      setError('')
      const token = await ensureAccessToken()
      if (!token) {
        setError('No hay token de acceso. Inicia sesión nuevamente.')
        return
      }
      const prefs = buildPreferences()
      const tracks = await generatePlaylist(prefs)
      const existingIds = new Set(playlist.map((t) => t.id))
      const newOnes = (tracks || []).filter((t) => !existingIds.has(t.id))
      setPlaylist((pl) => {
        const updated = [...pl, ...newOnes]
        setNotFound(updated.length === 0)
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-600/20 text-red-400 border border-red-600/40 px-3 py-2 rounded">
              {error}
            </div>
          )}
          <GenreWidget selectedItems={genres} onSelect={setGenres} />
          <ArtistWidget selectedItems={artists} onSelect={setArtists} />
          <PopularityWidget selectedItems={popularity} onSelect={setPopularity} />
          <DecadeWidget selectedItems={decades} onSelect={setDecades} />
          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded"
          >
            Generar playlist
          </button>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Refrescar
            </button>
            <button
              onClick={addMore}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Añadir más
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Playlist generada</h2>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : notFound ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-4xl font-bold text-red-500">404</div>
              <div className="text-gray-400">No se encontraron resultados con los filtros seleccionados.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {playlist.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isFavorite={!!favorites.find((f) => f.id === track.id)}
                  onToggleFavorite={toggleFavorite}
                  onRemove={removeTrack}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
