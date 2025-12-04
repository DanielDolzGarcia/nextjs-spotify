'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-6">Spotify Taste Mixer</h1>
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded"
        >
          Iniciar sesión con Spotify
        </button>
      </div>
    </main>
  );
}


