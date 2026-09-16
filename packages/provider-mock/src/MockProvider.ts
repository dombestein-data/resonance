import type {
    MusicProvider,
    PlaybackState,
    ProviderCapabilities,
    SearchResults,
} from '@resonance/core';

import { mockTracks } from './data/mockTracks';

export class MockProvider implements MusicProvider {
    readonly id = "mock";
    readonly name = "Mock Provider";

    readonly capabilities: ProviderCapabilities = {
        playback: true,
        search: true,
        library: false,
        playlists: false,
        queue: true,
        lyrics: false,
        recommendations: false,
        favorites: false,
    };

    private currentTrackIndex = 0;
    private playing = false;
    private positionMs = 0;

    async authenticate(): Promise<void> {
        // The mock provider does not require any authentication
    }

    async disconnect(): Promise<void> {
        this.playing = false;
    }

    async getPlaybackState(): Promise<PlaybackState> {
        const track = mockTracks[this.currentTrackIndex];

        return {
            track,
            playing: this.playing,
            positionMs: this.positionMs,
            durationMs: track.durationMs,
            volume: 1,
        };
    }

    async playTrack(trackId: string): Promise<void> {
        const index = mockTracks.findIndex(
            (track) => track.id === trackId,
        );

        if (index === -1) {
            throw new Error(`[moco-provider]: Track not found: ${trackId}`);
        }

        this.currentTrackIndex = index;
        this.positionMs = 0;
        this.playing = true;
    }

    async resume(): Promise<void> {
        this.playing = true;
    }

    async pause(): Promise<void> {
        this.playing = false;
    }

    async next(): Promise<void> {
        this.currentTrackIndex = 
            (this.currentTrackIndex + 1) % mockTracks.length;

        this.positionMs = 0;
    }

    async previous(): Promise<void> {
        this.currentTrackIndex = 
            (this.currentTrackIndex - 1 + mockTracks.length) %
            mockTracks.length;
        
        this.positionMs = 0;
    }

    async search(query: string): Promise<SearchResults> {
        const normalizedQuery = query.toLowerCase().trim();

        const tracks = mockTracks.filter((track) => {
            const titleMatches = track.title.toLowerCase().includes(normalizedQuery);
            const artistMatches = track.artists.some((artist) => artist.name.toLowerCase().includes(normalizedQuery));
            const albumMatches = track.album?.title.toLowerCase().includes(normalizedQuery);

            return titleMatches || artistMatches || albumMatches;
        });

        return { tracks };
    }
}