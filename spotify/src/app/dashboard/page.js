'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout, ensureAccessToken } from '@/lib/auth'
import { generatePlaylist } from '@/lib/spotify'
import GenreWidget from '@/components/widgets/GenreWidget'
import PopularityWidget from '@/components/widgets/PopularityWidget'
import DecadeWidget from '@/components/widgets/DecadeWidget'
import MoodWidget from '@/components/widgets/MoodWidget'
import ArtistWidget from '@/components/widgets/ArtistWidget'
import TrackWidget from '@/components/widgets/TrackWidget'
import TrackCard from '@/components/TrackCard'

export default function DashboardPage() {
  const router = useRouter()
  const [genres, setGenres] = useState([])
  const [playlist, setPlaylist] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('favorite_tracks') || '[]')
  })
  const [popularity, setPopularity] = useState([30, 100])
  const [mood, setMood] = useState({})
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
    popularity,
    mood
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

  const handleAddTrack = (track) => {
    const exists = playlist.some((t) => t.id === track.id)
    if (!exists) {
      setPlaylist((prev) => [track, ...prev])
      setNotFound(false)
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
      <div className="flex flex-col items-center gap-8 p-6 max-w-5xl mx-auto">
        {/* Panel de Configuración */}
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex justify-center">
            <div className="w-full">
              <ArtistWidget selectedItems={artists} onSelect={setArtists} />
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-600/20 text-red-400 border border-red-600/40 px-3 py-2 rounded text-center">
                {error}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveFilter((f) => (f === 'genres' ? null : 'genres'))}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'genres' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }`}
              >
                Géneros
              </button>
              <button
                onClick={() => setActiveFilter((f) => (f === 'popularity' ? null : 'popularity'))}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'popularity' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }`}
              >
                Popularidad
              </button>
              <button
                onClick={() => setActiveFilter((f) => (f === 'mood' ? null : 'mood'))}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'mood' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }`}
              >
                Mood
              </button>
              <button
                onClick={() => setActiveFilter((f) => (f === 'decades' ? null : 'decades'))}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeFilter === 'decades' ? 'bg-green-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }`}
              >
                Décadas
              </button>
            </div>

            <div className="space-y-4 transition-all duration-300 ease-in-out">
              {activeFilter === 'genres' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <GenreWidget selectedItems={genres} onSelect={setGenres} />
                </div>
              )}
              {activeFilter === 'popularity' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <PopularityWidget selectedItems={popularity} onSelect={setPopularity} />
                </div>
              )}
              {activeFilter === 'decades' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <DecadeWidget selectedItems={decades} onSelect={setDecades} />
                </div>
              )}
              {activeFilter === 'mood' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <MoodWidget selectedItems={mood} onSelect={setMood} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={generate}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg px-6 py-3 rounded-full shadow-lg hover:shadow-green-500/20 transition-all"
              >
                Generar Playlist
              </button>
              <div className="flex gap-2 sm:w-auto w-full">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition-colors"
                >
                  Refrescar
                </button>
                <button
                  onClick={addMore}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition-colors"
                >
                  Añadir más
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-200">Tu Playlist</h2>
          
          {/* Añadir canciones directamente (solo visible si hay playlist) */}
          {playlist.length > 0 && (
            <div className="mb-6 max-w-2xl mx-auto">
              <TrackWidget onAdd={handleAddTrack} />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : notFound ? (
            <div className="flex flex-col items-center justify-center h-60 text-center bg-gray-800/30 rounded-xl border border-gray-800 p-8">
              <div className="text-5xl font-bold text-gray-700 mb-4">404</div>
              <div className="text-gray-400 text-lg">No encontramos canciones con esos filtros. ¡Prueba otra combinación!</div>
            </div>
          ) : playlist.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-gray-800/30 rounded-xl border border-gray-800">
              <p className="text-lg">Configura tus filtros arriba y genera tu primera playlist</p>
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
