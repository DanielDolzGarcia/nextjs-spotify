import { getAccessToken } from '@/lib/auth';

export async function savePlaylistToSpotify(userId, name, tracks) {
  const token = getAccessToken();
  if (!token) return null;

  try {
    // 1. Crear playlist vacía
    const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name || 'Mi Playlist Generada',
        description: 'Creada con Creador de Playlists',
        public: false
      })
    });

    if (!createRes.ok) throw new Error('Error creando playlist');
    const playlistData = await createRes.json();
    const playlistId = playlistData.id;

    // 2. Añadir canciones en lotes de 100
    const uris = tracks.map(t => t.uri);
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100);
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: batch })
      });
    }

    return playlistData;
  } catch (error) {
    console.error('Error saving playlist:', error);
    return null;
  }
}

export async function getUserProfile() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
export async function generatePlaylist(preferences) {
  const { artists, tracks, genres, decades, popularity, mood } = preferences;
  const token = getAccessToken();
  let allTracks = [];

  // 0. Añadir tracks seleccionados explícitamente y sus artistas relacionados
  if (tracks && tracks.length > 0) {
    allTracks.push(...tracks);
    
    // Opcional: Traer más canciones del artista principal de cada track seleccionado
    for (const track of tracks) {
      if (track.artists && track.artists[0]) {
        try {
          const artistId = track.artists[0].id;
          const related = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (related.ok) {
            const data = await related.json();
            if (Array.isArray(data?.tracks)) {
              allTracks.push(...data.tracks);
            }
          }
        } catch (_) {}
      }
    }
  }

  // 1. Obtener top tracks de artistas seleccionados
  for (const artist of artists) {
    try {
      const tracks = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!tracks.ok) continue;
      const data = await tracks.json();
      if (Array.isArray(data?.tracks)) {
        allTracks.push(...data.tracks);
      }
    } catch (_) {}
  }

  // 2. Buscar por géneros (eliminar duplicados)
  const uniqueGenres = Array.from(new Set(genres));
  for (const genre of uniqueGenres) {
    try {
      const results = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=genre:${genre}&limit=20`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!results.ok) continue;
      const data = await results.json();
      if (Array.isArray(data?.tracks?.items)) {
        allTracks.push(...data.tracks.items);
      }
    } catch (_) {}
  }

  // 3. Filtrar por década
  if (decades.length > 0) {
    allTracks = allTracks.filter(track => {
      const year = new Date(track.album.release_date).getFullYear();
      return decades.some(decade => {
        const decadeStart = parseInt(decade);
        return year >= decadeStart && year < decadeStart + 10;
      });
    });
  }

  // 4. Filtrar por popularidad
  if (popularity) {
    const [min, max] = popularity;
    allTracks = allTracks.filter(
      track => track.popularity >= min && track.popularity <= max
    );
  }

  // 5. Filtrar por Audio Features (Mood)
  // Nota: Esto requeriría llamar a /v1/audio-features para cada track, lo cual es costoso.
  // Idealmente se usaría Recommendations API, pero está deprecada.
  // Como alternativa, haremos un filtrado "best effort" si tenemos pocos tracks,
  // o simplemente aceptamos que sin Recommendations API el filtrado de mood es limitado.
  // Para este ejercicio, asumiremos que si hay muchos tracks, filtramos una muestra.
  
  let uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  );

  if (mood && Object.keys(mood).length > 0) {
    // Para no saturar, tomamos los IDs de los candidatos (máx 50 para la llamada)
    // La API de audio-features acepta hasta 100 IDs
    const candidates = uniqueTracks.slice(0, 50);
    const ids = candidates.map(t => t.id).join(',');
    
    if (ids) {
      try {
        const featuresRes = await fetch(
          `https://api.spotify.com/v1/audio-features?ids=${ids}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (featuresRes.ok) {
          const featuresData = await featuresRes.json();
          const featuresMap = new Map(
            (featuresData.audio_features || []).filter(Boolean).map(f => [f.id, f])
          );

          uniqueTracks = uniqueTracks.filter(track => {
            // Si no está en los candidatos (porque cortamos a 50), lo dejamos pasar o lo quitamos.
            // Para ser estrictos, solo filtramos los que tenemos features.
            const f = featuresMap.get(track.id);
            if (!f) return true; // Si no pudimos obtener features, lo mantenemos por defecto

            // Validar cada criterio del mood
            return Object.entries(mood).every(([key, value]) => {
              if (key.startsWith('min_')) {
                const featureName = key.replace('min_', '');
                return f[featureName] >= value;
              }
              if (key.startsWith('max_')) {
                const featureName = key.replace('max_', '');
                return f[featureName] <= value;
              }
              return true;
            });
          });
        }
      } catch (e) {
        console.error('Error filtering by mood:', e);
      }
    }
  }

  // 6. Limitar a 30 canciones final
  return uniqueTracks.slice(0, 30);
}
