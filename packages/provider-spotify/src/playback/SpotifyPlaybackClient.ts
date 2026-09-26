/// <reference path="./SpotifyWebPlaybackSdk.d.ts" />

import { loadSpotifySdk } from "./loadSpotifySdk";

const PLAYER_READY_TIMEOUT_MS = 30_000;

export type SpotifyPlaybackFailureKind =
    | 'sdk'
    | 'initialization'
    | 'authentication'
    | 'account'
    | 'playback'
    | 'connection'
    | 'timeout';

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

export interface SpotifyNowPlayingState {
    trackName: string;
    artistNames: string[];
    paused: boolean;
    positionMs: number;
    durationMs: number;
}

export type SpotifyPlaybackStateListener = (
    state: SpotifyNowPlayingState | null,
) => void;

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

                player.addListener(
                    'player_state_changed',
                    (state) => {
                        if (!state) {
                            this.emitState(null);
                            return;
                        }

                        const currentTrack = state.track_window.current_track;

                        this.emitState({
                            trackName: currentTrack.name,

                            artistNames: currentTrack.artists.map(
                                (artist) => artist.name,
                            ),

                            paused: state.paused,
                            positionMs: state.position,
                            durationMs: state.duration,
                        });
                    },
                );

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

    async activateElement(): Promise<void> {
        if (!this.player) {
            throw new SpotifyPlaybackError(
                'connection',
                'Spotify player is not initialized',
            );
        }

        /*
         * player.activateElement() must be invoked directly
         * from a user-generated event such as a button click.
         */
        await this.player.activateElement();
    }

    async pause(): Promise<void> {
        if (!this.player) {
            throw new SpotifyPlaybackError(
                'connection',
                'Spotify player is not initialized',
            );
        }

        await this.player.pause();
    }

    async resume(): Promise<void> {
        if (!this.player) {
            throw new SpotifyPlaybackError(
                'connection',
                'Spotify player is not intialized',
            );
        }

        await this.player.resume();
    }

    disconnect(): void {
        this.player?.disconnect();
        this.player = null;
        this.emitState(null);
    }
}
