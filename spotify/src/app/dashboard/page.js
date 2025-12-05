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
    setLoading(true)
    await ensureAccessToken()
    const prefs = buildPreferences()
    const tracks = await generatePlaylist(prefs)
    setPlaylist(tracks || [])
    setLoading(false)
  }

  const refresh = async () => {
    await generate()
  }

  const addMore = async () => {
    setLoading(true)
    await ensureAccessToken()
    const prefs = buildPreferences()
    const tracks = await generatePlaylist(prefs)
    const existingIds = new Set(playlist.map((t) => t.id))
    const newOnes = (tracks || []).filter((t) => !existingIds.has(t.id))
    setPlaylist((pl) => [...pl, ...newOnes])
    setLoading(false)
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
          <GenreWidget selectedItems={genres} onSelect={setGenres} />
          <ArtistWidget selectedItems={artists} onSelect={setArtists} />
          <PopularityWidget selectedItems={popularity} onSelect={setPopularity} />
          <DecadeWidget selectedItems={decades} onSelect={setDecades} />
          <button
            onClick={generate}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded"
          >
            Generar playlist
          </button>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Refrescar
            </button>
            <button
              onClick={addMore}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
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
          ) : playlist.length === 0 ? (
            <div className="text-gray-400">No hay canciones. Usa los widgets y genera la playlist.</div>
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
