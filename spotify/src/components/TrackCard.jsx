'use client'

import Image from 'next/image'

export default function TrackCard({ track, isFavorite, onToggleFavorite, onRemove }) {
  const rawImage = track?.album?.images?.[0]?.url || ''
  const image = rawImage?.startsWith('https://iscdn.co/')
    ? rawImage.replace('https://iscdn.co/', 'https://i.scdn.co/')
    : rawImage
  const title = track?.name || ''
  const artist = track?.artists?.map(a => a.name).join(', ') || ''
  const durationMs = track?.duration_ms || 0
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-4 bg-gray-800 rounded p-3">
      <div className="w-12 h-12 relative">
        <Image src={image || '/vercel.svg'} alt={title} fill sizes="48px" className="rounded object-cover" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-400">{artist}</div>
      </div>
      <div className="text-sm text-gray-300 w-12 text-right">{minutes}:{seconds}</div>
      <button
        onClick={() => onToggleFavorite?.(track)}
        className={`px-3 py-2 rounded ${isFavorite ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-white'} hover:opacity-90`}
      >
        {isFavorite ? '★' : '☆'}
      </button>
      <button
        onClick={() => onRemove?.(track?.id)}
        className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Eliminar
      </button>
    </div>
  )
}
