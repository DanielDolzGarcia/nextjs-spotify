'use client'

import { useMemo, useState, useEffect } from 'react'

const ALL_GENRES = [
  'acoustic','afrobeat','alt-rock','alternative','ambient','anime','black-metal','bluegrass','blues','bossanova','brazil','breakbeat','british','cantopop','chicago-house','children','chill','classical','club','comedy','country','dance','dancehall','death-metal','deep-house','detroit-techno','disco','disney','drum-and-bass','dub','dubstep','edm','electro','electronic','emo','folk','forro','french','funk','garage','german','gospel','goth','grindcore','groove','grunge','guitar','happy','hard-rock','hardcore','hardstyle','heavy-metal','hip-hop','house','idm','indian','indie','indie-pop','industrial','iranian','j-dance','j-idol','j-pop','j-rock','jazz','k-pop','kids','latin','latino','malay','mandopop','metal','metal-misc','metalcore','minimal-techno','movies','mpb','new-age','new-release','opera','pagode','party','philippines-opm','piano','pop','pop-film','post-dubstep','power-pop','progressive-house','psych-rock','punk','punk-rock','r-n-b','rainy-day','reggae','reggaeton','road-trip','rock','rock-n-roll','rockabilly','romance','sad','salsa','samba','sertanejo','show-tunes','singer-songwriter','ska','sleep','songwriter','soul','soundtracks','spanish','study','summer','swedish','synth-pop','tango','techno','trance','trip-hop','turkish','work-out','world-music'
]

export default function GenreWidget({ selectedItems = [], onSelect, limit = 5 }) {
  const [query, setQuery] = useState('')
  const [internalSelected, setInternalSelected] = useState(selectedItems)

  useEffect(() => {
    setInternalSelected(selectedItems)
  }, [selectedItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_GENRES
    return ALL_GENRES.filter(g => g.includes(q))
  }, [query])

  const toggle = (genre) => {
    const exists = internalSelected.includes(genre)
    let next
    if (exists) {
      next = internalSelected.filter(g => g !== genre)
    } else {
      if (internalSelected.length >= limit) return
      next = [...internalSelected, genre]
    }
    setInternalSelected(next)
    onSelect?.(next)
  }

  return (
    <div className="bg-gray-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Géneros</h2>
        <span className="text-xs text-gray-400">{internalSelected.length}/{limit}</span>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar género"
        className="w-full mb-3 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.slice(0, 100).map((genre) => {
          const active = internalSelected.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className={`px-3 py-1 rounded text-sm border ${active ? 'bg-green-600 border-green-500 text-black' : 'bg-gray-700 border-gray-600 text-white'} hover:opacity-90`}
            >
              {genre}
            </button>
          )
        })}
      </div>
    </div>
  )
}

