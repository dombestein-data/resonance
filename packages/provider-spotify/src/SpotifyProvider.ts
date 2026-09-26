import type {
    MusicProvider,
    PlaybackState,
    PlaybackStateListener,
    ProviderCapabilities,
    RepeatMode,
    SearchResults,
} from '@resonance/core';

import {
    SpotifyAuthClient,
} from './auth/SpotifyAuthClient';

import {
    SpotifyPlaybackClient,
    type SpotifyNowPlayingState,
} from './playback/SpotifyPlaybackClient';

/**
 * Spotify implementation of Resonance's provider-neutral music-service
 * contract.
 *
 * Authentication is performed through Spotify's Authorization Code flow
 * with PKCE. Playback is provided by the Spotify Web Playback SDK, while
 * SDK state events are translated into Resonance's canonical playback models.
 *
 * The initial implementation supports controlling an existing Spotify
 * playback session. Catalogue search and starting a selected track will
 * be added separately.
 */

export class SpotifyProvider implements MusicProvider {
    readonly id = 'spotify';
    readonly name = 'Spotify';

    readonly capabilities: ProviderCapabilities = {
        playback: {
            playTrack: false,
            resume: true,
            pause: true,
            seek: true,
            next: true,
            previous: true,
            volume: true,
            shuffle: false,
            repeat: false,
        },

        search: false,

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

    private readonly authClient: SpotifyAuthClient;
    private readonly playbackClient: SpotifyPlaybackClient;

    private readonly playbackStateListeners = new Set<PlaybackStateListener>();

    private playbackState: PlaybackState | null = null;
    private volume = 1;

    /**
     * Creates a Spotify provider.
     * 
     * @param clientId Public client identifier assigned to Resonance in
     * the Spotify Developer dashboard.
     */
    constructor(clientId: string) {
        this.authClient = new SpotifyAuthClient(clientId);
        this.playbackClient = new SpotifyPlaybackClient();

        this.playbackClient.subscribeToState((state) => {
            this.playbackState = this.mapPlaybackState(state);
            this.emitPlaybackState();
        });
    }

    async authenticate(): Promise<void> {
        const token = await this.authClient.authenticate();

        try {
         await this.playbackClient.connect(token.accessToken);   
        } catch (error) {
            this.authClient.disconnect();
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.playbackClient.disconnect();
        this.authClient.disconnect();
    }

    async getPlaybackState(): Promise<PlaybackState | null> {
        return this.playbackState;
    }

    subscribeToPlaybackState(listener: PlaybackStateListener): () => void {
        this.playbackStateListeners.add(listener);

        return () => {
            this.playbackStateListeners.delete(listener);
        };
    }

    private emitPlaybackState(): void {
        for (const listener of this.playbackStateListeners) {
            listener(this.playbackState);
        }
    }

    async resume(): Promise<void> {
        // Called from a user click, so this also satisfies
        // browser audio activation requirements.
        await this.playbackClient.activateElement();
        await this.playbackClient.resume();
    }

    async pause(): Promise<void> {
        await this.playbackClient.pause();
    }

    async seek(positionMs: number): Promise<void> {
        if (!Number.isFinite(positionMs) || positionMs < 0) {
            throw new RangeError(
                '[spotify-provider]: positionMs must be a finite, non-negative number',
            );
        }

        await this.playbackClient.seek(positionMs);
    }

    async next(): Promise<void> {
        await this.playbackClient.nextTrack();
    }

    async previous(): Promise<void> {
        await this.playbackClient.previousTrack();
    }

    async setVolume(volume: number): Promise<void> {
        if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
            throw new RangeError(
                '[spotify-provider]: volume must be a finite number between 0.0 and 1.0',
            );
        }

        await this.playbackClient.setVolume(volume);
        this.volume = volume;

        if (this.playbackState) {
            this.playbackState = {
                ...this.playbackState,
                volume,
            };

            this.emitPlaybackState();
        }
    }

    async playTrack(_providerTrackId: string): Promise<void> {
        throw new Error(
            'Starting a specific Spotify track is not implemented yet.',
        );
    }

    async setShuffle(_enabled: boolean): Promise<void> {
        throw new Error('Spotify shuffle control is not implemented yet.');
    }

    async setRepeatMode(_mode: RepeatMode): Promise<void> {
        throw new Error('Spotify repeat control is not implemented yet.');
    }

    async search(_query: string): Promise<SearchResults> {
        /*
         * Spotify catalogue search is not implemented yet. Returning an empty
         * result keeps generic initialization paths safe while the corresponding
         * capability remains disabled.
         */
        return {
            tracks: [],
        };
    }

    /**
     * Extracts a provider-local resource ID from a Spotify URI.
     *
     * @param uri Spotify resource URI containing a provider-local identifier.
     * @returns The final URI segment, or the original value when no usable final
     * segment is present.
     *
     * @example
     * `spotify:track:abc123` becomes `abc123`.
     */
    private idFromSpotifyUri(uri: string): string {
        const segments = uri.split(':');
        return segments[segments.length - 1] || uri;
    }

    /**
     * Converts a Spotify Web Playback SDK state snapshot into
     * Resonance's provider-neutral playback model.
     *
     * @param state The latest normalized Spotify playback state, or `null` when
     * Spotify playback state is not currently available.
     * @returns The equivalent Resonance playback state, or `null` when the supplied
     * Spotify state is unavailable.
     */
    private mapPlaybackState(
        state: SpotifyNowPlayingState | null,
    ): PlaybackState | null {
        if (!state) {
            return null;
        }

        const providerTrackId =
            state.trackId ??
            this.idFromSpotifyUri(state.trackUri);

        const artwork = state.album.artworkUrl
            ? {
                url: state.album.artworkUrl,
            }
            : undefined;
        return {
            track: {
                id: `spotify:track:${providerTrackId}`,
                provider: this.id,
                providerTrackId,
                title: state.trackName,

                artists: state.artists.map((artist) => {
                    const providerArtistId = this.idFromSpotifyUri(artist.uri);

                    return {
                        id: `spotify:artist:${providerArtistId}`,
                        provider: this.id,
                        providerArtistId,
                        name: artist.name,
                    };
                }),

                album: {
                    id: `spotify:album:${this.idFromSpotifyUri(
                        state.album.uri,
                    )}`,
                    provider: this.id,
                    providerAlbumId: this.idFromSpotifyUri(
                        state.album.uri,
                    ),
                    title: state.album.name,
                    artwork,
                },

                durationMs: state.durationMs,
                artwork,
                playable: state.playable,
            },

            status: state.paused ? 'paused' : 'playing',
            positionMs: state.positionMs,
            volume: this.volume,
        };
    }
}
