import { useEffect, useState } from 'react';
import type { PlaybackState, Track } from '@resonance/core';
import { MockProvider } from '@resonance/provider-mock';

const provider = new MockProvider();

function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);

  async function refreshPlayback() {
    setPlayback(await provider.getPlaybackState());
  }

  useEffect(() => {
    async function initialize() {
      await provider.authenticate();

      const results = await provider.search("");
      setTracks(results.tracks);

      await refreshPlayback();
    }

    initialize();
  }, []);

  async function playTrack(trackId: string) {
    await provider.playTrack(trackId);
    await refreshPlayback();
  }

  async function togglePlayback() {
    if (playback?.playing) {
      await provider.pause();
    } else {
      await provider.resume();
    }

    await refreshPlayback();
  }

  return (
    <main>
      <h1>Resonance</h1>

      <h2>Tracks</h2>

      {tracks.map((track) => (
        <div key={track.id}>
          <strong>{track.title}</strong>
          {" - "}
          {track.artists.map((artist) => artist.name).join(", ")}

          <button onClick={() => playTrack(track.id)}>
            Play
          </button>
        </div>
      ))}

      <h2>Now Playing</h2>

      {playback?.track ? (
        <>
          <p>
            {playback.track.title} - {" "}
            {playback.track.artists.map((artist) => artist.name).join(", ")}
          </p>

          <button onClick={togglePlayback}>
            {playback.playing ? "Pause" : "Resume"}
          </button>
        </>
      ) : (
        <p>Nothing playing</p>
      )}
    </main>
  );
}

export default App;