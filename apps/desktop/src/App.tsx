import { useEffect, useState } from 'react';
import type { PlaybackState, Track } from '@resonance/core';
import { useMusicProvider } from './providers/MusicProviderContext';
import {
  AppShell,
  type AppDestination,
} from './components/AppShell';
import { PlayerBar } from './components/PlayerBar';
import { PlaybackEnvironmentProbe } from './components/PlaybackEnvironmentProbe';
import { SpotifyProviderSettings } from './components/SpotifyProviderSettings';

function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDestination, setActiveDestination] = useState<AppDestination>('home');
  const { activeProvider: provider } = useMusicProvider();

  function navigateTo(destination: AppDestination) {
    setActiveDestination(destination);

    if (destination === 'home') {
      setSearchQuery('');

      if (provider.capabilities.search) {
        void searchTracks('');
      } else {
        setTracks([]);
      }
    }
  }

  useEffect(() => {
    let disposed = false;

    /*
     * Avoid displaying data belonging to the previously active provider while
     * the newly selected provider's initial state is being loaded.
     */
    setPlayback(null);
    setTracks([]);

    /*
    * Subscribe before requesting the initial state so we do not miss a 
    * provider event emitted while initialization is running.
    */
    const unsubscribe = provider.subscribeToPlaybackState((state) => {
      if (!disposed) {
        setPlayback(state);
      }
    });

    async function initializeProviderState() {
      try {
        if (provider.capabilities.search) {
          const results = await provider.search('');

          if (!disposed) {
            setTracks(results.tracks);
          }
        }

        const initialPlayback = await provider.getPlaybackState();

        if (!disposed) {
          setPlayback(initialPlayback);
        }
      } catch (error) {
        console.error(
          '[resonance]: Failed to initialize active provider',
          error,
        );
      }
    }

    void initializeProviderState();

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [provider]);

  async function playTrack(providerTrackId: string) {
    await provider.playTrack(providerTrackId);
  }

  async function togglePlayback() {
    if (playback?.status === 'playing') {
      await provider.pause();
    } else {
      await provider.resume();
    }
  }

  async function searchTracks(query: string) {
    const results = await provider.search(query);
    setTracks(results.tracks);
  }

  async function submitSearch() {
    if (!provider.capabilities.search) {
      return;
    }

    await searchTracks(searchQuery);
    setActiveDestination('home');
  }

  async function playPrevious() {
    await provider.previous();
  }

  async function playNext() {
    await provider.next();
  }

  async function seek(positionMs: number) {
    await provider.seek(positionMs);
  }

  async function changeVolume(volume: number) {
    await provider.setVolume(volume);
  }

  function renderMainContent() {
    switch (activeDestination) {
      case 'library':
        return (
          <>
            <h1>Library</h1>
            <p>Library support has not yet been added.</p>
          </>
        );

      case 'settings':
        return (
          <>
            <h1>Settings</h1>
            <PlaybackEnvironmentProbe />
            <SpotifyProviderSettings />
          </>
        );

      case 'home':
        return (
          <>
            <h1>Home</h1>
            <h2>Tracks</h2>

            {tracks.length > 0 ? (
              tracks.map((track) => (
                <div key={track.id}>
                  <strong>{track.title}</strong>
                  {' - '}
                  {track.artists.map((artist) => artist.name).join(', ')}

                  <button
                    type="button"
                    onClick={() => playTrack(track.providerTrackId)}
                  >
                    Play
                  </button>
                </div>
              ))
            ) : (
              <p>No tracks found.</p>
            )}
          </>
        );
    }
  }

  return (
    <AppShell
      activeDestination={activeDestination}
      onNavigate={navigateTo}
      searchQuery={searchQuery}
      searchEnabled={provider.capabilities.search}
      onSearchQueryChange={setSearchQuery}
      onSearch={submitSearch}
      mainContent={renderMainContent()}

      player={
        <PlayerBar
          playback={playback}
          capabilities={provider.capabilities.playback}
          onTogglePlayback={togglePlayback}
          onPrevious={playPrevious}
          onNext={playNext}
          onSeek={seek}
          onVolumeChange={changeVolume}
        />
      }
    />
  );
}

export default App;