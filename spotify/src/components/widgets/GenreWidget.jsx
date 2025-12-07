'use client'

import { useMemo, useState, useEffect } from 'react'

const ALL_GENRES = [
  'acoustic','afrobeat','alt-rock','alternative','ambient','anime','black-metal','bluegrass','blues','bossanova','brazil','breakbeat','british','cantopop','chicago-house','children','chill','classical','club','comedy','country','dance','dancehall','death-metal','deep-house','detroit-techno','disco','disney','drum-and-bass','dub','dubstep','edm','electro','electronic','emo','folk','forro','french','funk','garage','german','gospel','goth','grindcore','groove','grunge','guitar','happy','hard-rock','hardcore','hardstyle','heavy-metal','hip-hop','house','idm','indian','indie','indie-pop','industrial','iranian','j-dance','j-idol','j-pop','j-rock','jazz','k-pop','kids','latin','latino','malay','mandopop','metal','metal-misc','metalcore','minimal-techno','movies','mpb','new-age','new-release','opera','pagode','party','philippines-opm','piano','pop','pop-film','post-dubstep','power-pop','progressive-house','psych-rock','punk','punk-rock','r-n-b','rainy-day','reggae','reggaeton','road-trip','rock','rock-n-roll','rockabilly','romance','sad','salsa','samba','sertanejo','show-tunes','singer-songwriter','ska','sleep','songwriter','soul','soundtracks','spanish','study','summer','swedish','synth-pop','tango','techno','trance','trip-hop','turkish','work-out','world-music'
]

const POPULAR_GENRES = [
  'pop','rock','hip-hop','indie','alt-rock','electronic','house','reggaeton','latin','chill'
]
const POPULAR_SET = new Set(POPULAR_GENRES)

export default function GenreWidget({ selectedItems = [], onSelect, limit = 5 }) {
  const [query, setQuery] = useState('')
  const [internalSelected, setInternalSelected] = useState(selectedItems)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    setInternalSelected(selectedItems)
  }, [selectedItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q ? ALL_GENRES.filter(g => g.includes(q)) : ALL_GENRES
    return base.sort((a, b) => {
      const aPop = POPULAR_SET.has(a) ? 1 : 0
      const bPop = POPULAR_SET.has(b) ? 1 : 0
      if (aPop !== bPop) return bPop - aPop
      return a.localeCompare(b)
    })
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

  const clearAll = () => {
    setInternalSelected([])
    onSelect?.([])
  }

  const renderLabel = (genre) => {
    const q = query.trim().toLowerCase()
    if (!q) return genre
    const i = genre.indexOf(q)
    if (i === -1) return genre
    const before = genre.slice(0, i)
    const match = genre.slice(i, i + q.length)
    const after = genre.slice(i + q.length)
    return (
      <>
        {before}
        <span className="bg-yellow-400/20 text-yellow-300 px-0.5 rounded">{match}</span>
        {after}
      </>
    )
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
        className="w-full mb-2 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
      />
      {internalSelected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {internalSelected.map((g) => (
            <button
              key={g}
              onClick={() => toggle(g)}
              className="px-3 py-1 rounded-full bg-gray-700 text-white border border-gray-600 hover:bg-gray-600"
            >
              {g} ×
            </button>
          ))}
          <button onClick={clearAll} className="ml-auto text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white">Limpiar</button>
        </div>
      )}
      {query.trim() === '' ? (
        <>
          <div className="mb-2 text-sm text-gray-400">Populares</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {filtered.filter(g => POPULAR_SET.has(g)).map((genre) => {
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
          {!showMore ? (
            <button onClick={() => setShowMore(true)} className="text-sm text-gray-300 hover:text-white underline">Ver más géneros</button>
          ) : (
            <>
              <div className="mb-2 text-sm text-gray-400">Todos</div>
              <div className="flex flex-wrap gap-2">
                {filtered.filter(g => !POPULAR_SET.has(g)).map((genre) => {
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
              <button onClick={() => setShowMore(false)} className="mt-3 text-sm text-gray-300 hover:text-white underline">Ver menos</button>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((genre) => {
            const active = internalSelected.includes(genre)
            return (
              <button
                key={genre}
                onClick={() => toggle(genre)}
                className={`px-3 py-1 rounded text-sm border ${active ? 'bg-green-600 border-green-500 text-black' : 'bg-gray-700 border-gray-600 text-white'} hover:opacity-90`}
              >
                {renderLabel(genre)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
