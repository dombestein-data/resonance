/// <reference path="./SpotifyWebPlaybackSdk.d.ts" />

import { loadSpotifySdk } from "./loadSpotifySdk";

const PLAYER_READY_TIMEOUT_MS = 30_000;

/**
 * Categories of failure that may occur while loading, connecting, or operating
 * the Spotify Web Playback SDK.
 */
export type SpotifyPlaybackFailureKind =
    | 'sdk'
    | 'initialization'
    | 'authentication'
    | 'account'
    | 'playback'
    | 'connection'
    | 'timeout'
    | 'not_ready';

/**
 * Error produced by the Spotify playback integration.
 *
 * {@link kind} identifies the stage or category of failure so consumers can
 * present appropriate diagnostics without parsing the human-readable message.
 */
export class SpotifyPlaybackError extends Error {
    constructor(
        readonly kind: SpotifyPlaybackFailureKind,
        message: string,
    ) {
        super(message);
        this.name = 'SpotifyPlaybackError';
    }
}

export interface SpotifyPlaybackConnection {
    deviceId: string;
}

/**
 * Artist information normalized from a Spotify Web Playback SDK event.
 */
export interface SpotifyNowPlayingArtist {
    uri: string;
    name: string;
}

/**
 * Album information normalized from a Spotify Web Playback SDK event.
 */
export interface SpotifyNowPlayingAlbum {
    uri: string;
    name: string;
    artworkUrl?: string;
}

/**
 * Provider-specific playback state emitted by SpotifyPlaybackClient before it
 * is translated into Resonance's canonical PlaybackState.
 */
export interface SpotifyNowPlayingState {
    trackId: string | null;
    trackUri: string;
    trackType: string;
    trackName: string;
    playable: boolean;

    artists: SpotifyNowPlayingArtist[];
    album: SpotifyNowPlayingAlbum;

    paused: boolean;
    positionMs: number;
    durationMs: number;
}

export type SpotifyPlaybackStateListener = (
    state: SpotifyNowPlayingState | null,
) => void;

/**
 * Thin wrapper around Spotify's Web Playback SDK.
 *
 * The client owns one SDK player instance, translates SDK events into a stable
 * provider-specific state representation, and exposes playback controls without
 * leaking the global Spotify SDK object to the rest of Resonance.
 *
 * This class does not own OAuth authorization or convert Spotify state into
 * Resonance's canonical models. Those responsibilities belong to
 * SpotifyAuthClient and SpotifyProvider respectively.
 */
export class SpotifyPlaybackClient {
    private player: Spotify.Player | null = null;

    private readonly stateListeners = new Set<SpotifyPlaybackStateListener>();

    subscribeToState(
        listener: SpotifyPlaybackStateListener,
    ): () => void {
        this.stateListeners.add(listener);

        return () => {
            this.stateListeners.delete(listener);
        };
    }

    private emitState(
        state: SpotifyNowPlayingState | null,
    ): void {
        for (const listener of this.stateListeners) {
            listener(state);
        }
    }

    private getRequiredPlayer(): Spotify.Player {
        if (!this.player) {
            throw new SpotifyPlaybackError(
                'not_ready',
                'Spotify player has not been initialized',
            );
        }

        return this.player;
    }

    /**
     * Creates and connects a new Spotify Web Playback SDK player.
     *
     * Any existing player owned by this client is disconnected before the new
     * player is created. The returned promise resolves after Spotify reports the
     * new device as ready.
     *
     * @param accessToken OAuth access token containing the scopes required by the
     * Web Playback SDK.
     * @returns Identifying information for the connected Spotify device.
     * @throws {SpotifyPlaybackError} if the SDK cannot be loaded, initialization
     * fails, authentication is rejected, or the player does not become ready.
     */
    async connect(
        accessToken: string,
    ): Promise<SpotifyPlaybackConnection> {
        if (!accessToken.trim()) {
            throw new SpotifyPlaybackError(
                'authentication',
                'Spotify access token is missing',
            );
        }

        this.disconnect();

        try {
            await loadSpotifySdk();
        } catch (error) {
            throw new SpotifyPlaybackError(
                'sdk',
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }

        if (!window.Spotify?.Player) {
            throw new SpotifyPlaybackError(
                'sdk',
                'Spotify.Player is unavailable after loading the SDK',
            );
        }

        const player = new window.Spotify.Player({
            name: 'Resonance',
            getOAuthToken: (callback) => {
                callback(accessToken);
            },
            volume: 1,
            enableMediaSession: true,
        });

        this.player = player;

        return new Promise<SpotifyPlaybackConnection>(
            (resolve, reject) => {
                let settled = false;

                const timeout = window.setTimeout(() => {
                    fail(
                        new SpotifyPlaybackError(
                            'timeout',
                            'Spotify player did not become ready within 30 seconds',
                        ),
                    );
                }, PLAYER_READY_TIMEOUT_MS);

                const succeed = (deviceId: string) => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    window.clearTimeout(timeout);

                    resolve({ deviceId });
                };

                const fail = (
                    error: SpotifyPlaybackError,
                ) => {
                    if (settled) {
                        return;
                    }

                    settled = true;
                    window.clearTimeout(timeout);

                    /*
                     * Keep the failed player available long enough
                     * for its diagnostic event to complete, then
                     * release it.
                     */
                    player.disconnect();

                    if (this.player === player) {
                        this.player = null;
                    }

                    reject(error);
                };

                player.addListener(
                    'ready',
                    ({ device_id }) => {
                        succeed(device_id);
                    },
                );

                player.addListener(
                    'not_ready',
                    ({ device_id }) => {
                        console.warn(
                            '[spotify-playback]: Device became unavailable',
                            device_id,
                        );
                    },
                );

                player.addListener(
                    'initialization_error',
                    ({ message }) => {
                        fail(
                            new SpotifyPlaybackError(
                                'initialization',
                                message,
                            ),
                        );
                    },
                );

                player.addListener(
                    'authentication_error',
                    ({ message }) => {
                        fail(
                            new SpotifyPlaybackError(
                                'authentication',
                                message,
                            ),
                        );
                    },
                );

                player.addListener(
                    'account_error',
                    ({ message }) => {
                        fail(
                            new SpotifyPlaybackError(
                                'account',
                                message,
                            ),
                        );
                    },
                );

                player.addListener(
                    'playback_error',
                    ({ message }) => {
                        console.error(
                            '[spotify-playback]: Playback error',
                            message,
                        );
                    },
                );

                player.addListener(
                    'autoplay_failed',
                    () => {
                        console.warn(
                            '[spotify-playback]: Autoplay was blocked',
                        );
                    },
                );

                player.addListener('player_state_changed', (state) => {
                    if (!state) {
                        this.emitState(null);
                        return;
                    }

                    const track = state.track_window.current_track;

                    this.emitState({
                        trackId: track.id,
                        trackUri: track.uri,
                        trackType: track.type,
                        trackName: track.name,
                        playable: track.is_playable,

                        artists: track.artists.map((artist) => ({
                            uri: artist.uri,
                            name: artist.name,
                        })),

                        album: {
                            uri: track.album.uri,
                            name: track.album.name,
                            artworkUrl: track.album.images[0]?.url,
                        },

                        paused: state.paused,
                        positionMs: state.position,
                        durationMs: state.duration,
                    });
                });

                void player
                    .connect()
                    .then((connected) => {
                        if (!connected) {
                            fail(
                                new SpotifyPlaybackError(
                                    'connection',
                                    'Spotify.Player.connect() returned false',
                                ),
                            );
                        }
                    })
                    .catch((error) => {
                        fail(
                            new SpotifyPlaybackError(
                                'connection',
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                            ),
                        );
                    });
            },
        );
    }

    /**
     * Allows the SDK player to produce audio in environments that enforce
     * autoplay restrictions.
     *
     * This operation must be initiated as part of a user gesture, such as a button
     * click. Calling it later from an unrelated asynchronous callback may not
     * satisfy the browser or WebView's autoplay policy.
     */
    async activateElement(): Promise<void> {
        const player = this.getRequiredPlayer();

        /*
         * player.activateElement() must be invoked directly
         * from a user-generated event such as a button click.
         */
        await player.activateElement();
    }

    async seek(positionMs: number): Promise<void> {
        const player = this.getRequiredPlayer();
        await player.seek(Math.max(0, positionMs));
    }

    async nextTrack(): Promise<void> {
        const player = this.getRequiredPlayer();
        await player.nextTrack();
    }

    async previousTrack(): Promise<void> {
        const player = this.getRequiredPlayer();
        await player.previousTrack();
    }

    async getVolume(): Promise<number> {
        const player = this.getRequiredPlayer();
        return player.getVolume();
    }

    async setVolume(volume: number): Promise<void> {
        const player = this.getRequiredPlayer();
        const normalizedVolume = Math.max(0, Math.min(1, volume));

        await player.setVolume(normalizedVolume);
    }

    async pause(): Promise<void> {
        const player = this.getRequiredPlayer();

        await player.pause();
    }

    async resume(): Promise<void> {
        const player = this.getRequiredPlayer();

        await player.resume();
    }

    disconnect(): void {
        this.player?.disconnect();
        this.player = null;
        this.emitState(null);
    }
}
