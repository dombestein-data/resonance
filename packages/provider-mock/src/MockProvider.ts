import type {
    MusicProvider,
    PlaybackState,
    PlaybackStateListener,
    ProviderCapabilities,
    RepeatMode,
    SearchResults,
} from '@resonance/core';

import { mockTracks } from './data/mockTracks';

/**
 * In-memory music provider used for development and testing.
 *
 * The provider implements Resonance's complete provider contract without
 * communicating with an external service. Playback operations update local
 * state and synchronously notify registered playback-state listeners.
 */
export class MockProvider implements MusicProvider {
    readonly id = "mock";
    readonly name = "Mock Provider";

    readonly capabilities: ProviderCapabilities = {
        playback: {
            playTrack: true,
            resume: true,
            pause: true,
            seek: true,
            next: true,
            previous: true,
            volume: true,
            shuffle: false,
            repeat: false,
        },

        search: true,

        library: {
            read: false,
            add: false,
            remove: false,
        },

        playlists: {
            read: false,
            create: false,
            update: false,
            addItems: false,
            removeItems: false,
            reorderItems: false,
            delete: false,
        },

        queue: {
            read: false,
            add: false,
            remove: false,
            reorder: false,
            clear: false,
        },

        lyrics: false,
        recommendations: false,

        favorites: {
            read: false,
            add: false,
            remove: false,
        },
    };

    private currentTrackIndex: number | null = null;
    private status: PlaybackState['status'] = 'idle';
    private positionMs = 0;
    private volume = 1;

    private readonly playbackStateListeners = new Set<PlaybackStateListener>();

    subscribeToPlaybackState(listener: PlaybackStateListener): () => void {
        this.playbackStateListeners.add(listener);

        return () => {
            this.playbackStateListeners.delete(listener);
        };
    }

    private createPlaybackState(): PlaybackState {
        if (this.currentTrackIndex === null) {
            return {
                track: null,
                status: 'idle',
                positionMs: 0,
                volume: this.volume,
            };
        }

        return {
            track: mockTracks[this.currentTrackIndex],
            status: this.status,
            positionMs: this.positionMs,
            volume: this.volume,
        };
    }

    private emitPlaybackState(): void {
        const state = this.createPlaybackState();

        for (const listener of this.playbackStateListeners) {
            listener(state);
        }
    }

    async authenticate(): Promise<void> {
        // The mock provider does not require any authentication
    }

    async disconnect(): Promise<void> {
        this.currentTrackIndex = null;
        this.status = 'idle';
        this.positionMs = 0;
        this.emitPlaybackState();
    }

    async getPlaybackState(): Promise<PlaybackState> {
        return this.createPlaybackState();
    }

    async playTrack(providerTrackId: string): Promise<void> {
        const index = mockTracks.findIndex(
            (track) => track.providerTrackId === providerTrackId,
        );

        if (index === -1) {
            throw new Error(`[mock-provider]: Track not found: ${providerTrackId}`);
        }

        this.currentTrackIndex = index;
        this.positionMs = 0;
        this.status = 'playing';
        this.emitPlaybackState();
    }

    async resume(): Promise<void> {
        if (this.currentTrackIndex === null) {
            throw new Error('[mock-provider]: No track loaded');
        }

        this.status = 'playing';
        this.emitPlaybackState();
    }

    async pause(): Promise<void> {
        if (this.currentTrackIndex === null) {
            return;
        }
        this.status = 'paused';
        this.emitPlaybackState();
    }

    async seek(positionMs: number): Promise<void> {
        if (!Number.isFinite(positionMs) || positionMs < 0) {
            throw new RangeError(
                '[mock-provider]: positionMs must be a finite, non-negative number',
            );
        }

        if (this.currentTrackIndex === null) {
            throw new Error('[mock-provider]: No track loaded');
        }

        this.positionMs = positionMs;
        this.emitPlaybackState();
    }

    async next(): Promise<void> {
        if (this.currentTrackIndex === null) {
            throw new Error('[mock-provider]: No track loaded');
        }

        this.currentTrackIndex =
            (this.currentTrackIndex + 1) % mockTracks.length;

        this.positionMs = 0;
        this.emitPlaybackState();
    }

    async previous(): Promise<void> {
        if (this.currentTrackIndex === null) {
            throw new Error('[mock-provider]: No track loaded');
        }

        this.currentTrackIndex =
            (this.currentTrackIndex - 1 + mockTracks.length) %
            mockTracks.length;

        this.positionMs = 0;
        this.emitPlaybackState();
    }

    async setVolume(volume: number): Promise<void> {
        if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
            throw new RangeError(
                '[mock-provider]: volume must be a finite number between 0.0 and 1.0',
            );
        }

        this.volume = volume;
        this.emitPlaybackState();
    }

    async setShuffle(_enabled: boolean): Promise<void> {
        // Shuffle is not yet implemented by the mock provider.
    }

    async setRepeatMode(_mode: RepeatMode): Promise<void> {
        // Repeat is not yet implemented by the mock provider.
    }

    async search(query: string): Promise<SearchResults> {
        const normalizedQuery = query.toLowerCase().trim();
        const queryTerms = normalizedQuery
            ? normalizedQuery.split(/\s+/)
            : [];

        const tracks = mockTracks.filter((track) => {
            const searchableText = [
                track.title,
                track.album?.title,
                ...track.artists.map((artist) => artist.name),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return queryTerms.every((term) => searchableText.includes(term));
        });

        return { tracks };
    }
}
