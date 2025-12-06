import { getAccessToken } from '@/lib/auth';

export async function generatePlaylist(preferences) {
  const { artists, genres, decades, popularity } = preferences;
  const token = getAccessToken();
  if (!token) return [];
  let allTracks = [];

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

  // 5. Eliminar duplicados y limitar a 30 canciones
  const uniqueTracks = Array.from(
    new Map(allTracks.map(track => [track.id, track])).values()
  ).slice(0, 30);

  return uniqueTracks;
}
