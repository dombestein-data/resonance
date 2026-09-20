import type {
    PlaybackCapabilities,
    PlaybackState,
} from '@resonance/core';

import {
    IconArrowsShuffle,
    IconPlayerPause,
    IconPlayerPlay,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconRepeat,
    IconVolume,
} from '@tabler/icons-react';

interface PlayerBarProps {
    playback: PlaybackState | null;
    capabilities: PlaybackCapabilities;
    onTogglePlayback: () => Promise<void>;
    onPrevious: () => Promise<void>;
    onNext: () => Promise<void>;
    onSeek: (positionMs: number) => Promise<void>;
    onVolumeChange: (volume: number) => Promise<void>;
}

function formatDuration(durationMs: number): string {
    const totalSeconds = Math.floor(Math.max(0, durationMs) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function PlayerBar({
    playback,
    capabilities,
    onTogglePlayback,
    onPrevious,
    onNext,
    onSeek,
    onVolumeChange,
}: PlayerBarProps) {
    const track = playback?.track;
    const hasTrack = Boolean(track);
    const isPlaying = playback?.status === 'playing';
    const durationMs = track?.durationMs ?? 0;
    const positionMs = Math.min(
        Math.max(playback?.positionMs ?? 0, 0),
        durationMs,
    );

    return (
        <>
            <section className="now-playing" aria-label="Now playing">
                <div className="now-playing-artwork" aria-hidden="true">
                    {track?.artwork ? (
                        <img src={track.artwork.url} alt="" />
                    ) : (
                        <span>♪ ♪</span>
                    )}
                </div>

                <div className="now-playing-metadata">
                    <strong>{track?.title ?? 'Nothing playing'}</strong>
                    <span>
                        {track
                            ? track.artists.map((artist) => artist.name).join(', ')
                            : 'Choose a track to begin'}
                    </span>
                </div>
            </section>

            <section className="playback-controls" aria-label="Playback controls">
                <button type="button" aria-label="Shuffle" disabled>
                    <IconArrowsShuffle aria-hidden="true" size={20} />
                </button>

                <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => void onPrevious()}
                    disabled={!hasTrack || !capabilities.previous}
                >
                    <IconPlayerSkipBack aria-hidden="true" size={20} />
                </button>

                <button
                    className="primary-playback-control"
                    type="button"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    onClick={() => void onTogglePlayback()}
                    disabled={
                        !hasTrack ||
                        (isPlaying ? !capabilities.pause : !capabilities.resume)
                    }
                >
                    {isPlaying ? (
                        <IconPlayerPause aria-hidden="true" size={24} />
                    ) : (
                        <IconPlayerPlay aria-hidden="true" size={24} />
                    )}
                </button>

                <button
                    type="button"
                    aria-label="Next"
                    onClick={() => void onNext()}
                    disabled={!hasTrack || !capabilities.next}
                >
                    <IconPlayerSkipForward aria-hidden="true" size={20} />
                </button>

                <button type="button" aria-label="Repeat" disabled>
                    <IconRepeat aria-hidden="true" size={20} />
                </button>
            </section>

            <label className="playback-progress">
                <span className="visually-hidden">Playback position</span>

                <span className="playback-time" aria-hidden="true">
                    {formatDuration(positionMs)}
                </span>
                <input
                    type="range"
                    min="0"
                    max={durationMs || 1}
                    step="1000"
                    value={positionMs}
                    disabled={!hasTrack || !capabilities.seek}
                    onChange={(event) =>
                        void onSeek(Number(event.currentTarget.value))
                    }
                />

                <span className="playback-time" aria-hidden="true">
                    {formatDuration(durationMs)}
                </span>
            </label>

            <label className="playback-volume">
                <span className="visually-hidden">Volume</span>
                <IconVolume aria-hidden="true" size={20} />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={playback?.volume ?? 1}
                    disabled={!capabilities.volume}
                    onChange={(event) =>
                        void onVolumeChange(Number(event.currentTarget.value))
                    }
                />
            </label>
        </>
    );
}