import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import type {
    PlaybackState,
} from '@resonance/core';

import {
    SpotifyProvider,
} from '@resonance/provider-spotify';

type ConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'disconnecting'
    | 'failed';

export function SpotifyProviderProbe() {
    const clientId =
        import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? '';

    const provider = useMemo(
        () => (
            clientId
                ? new SpotifyProvider(clientId)
                : null
        ),
        [clientId],
    );

    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [playback, setPlayback] = useState<PlaybackState | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!provider) {
            setPlayback(null);
            return;
        }

        let disposed = false;

        const unsubscribe =
            provider.subscribeToPlaybackState((state) => {
                if (!disposed) {
                    setPlayback(state);
                }
            });

        void provider.getPlaybackState().then((state) => {
            if (!disposed) {
                setPlayback(state);
            }
        });

        return () => {
            disposed = true;
            unsubscribe();

            /*
             * The subscription is removed before disconnecting so the unmount
             * cleanup cannot update React state.
             */
            void provider.disconnect();
        };
    }, [provider]);

    async function connect() {
        if (!provider) {
            return;
        }

        setConnectionStatus('connecting');
        setErrorMessage(null);

        try {
            await provider.authenticate();
            setConnectionStatus('connected');
        } catch (error) {
            setConnectionStatus('failed');
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    async function disconnect() {
        if (!provider) {
            return;
        }

        setConnectionStatus('disconnecting');
        setErrorMessage(null);

        try {
            await provider.disconnect();
            setConnectionStatus('disconnected');
        } catch (error) {
            setConnectionStatus('failed');
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    async function performOperation(
        operation: () => Promise<void>,
    ) {
        setErrorMessage(null);

        try {
            await operation();
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    if (!provider) {
        return (
            <section className="spotify-auth-probe">
                <h2>Spotify provider</h2>

                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Spotify client ID unavailable</strong>
                    <p>
                        Configure VITE_SPOTIFY_CLIENT_ID before testing
                        SpotifyProvider.
                    </p>
                </div>
            </section>
        );
    }

    const track = playback?.track;
    const isPlaying = playback?.status === 'playing';

    return (
        <section className="spotify-auth-probe">
            <div className="spotify-auth-header">
                <div>
                    <h2>Spotify provider integration</h2>
                    <p>
                        Tests Spotify through Resonance&apos;s MusicProvider contract.
                    </p>
                </div>

                {connectionStatus === 'connected' ? (
                    <button
                        type="button"
                        onClick={() => void disconnect()}
                    >
                        Disconnect provider
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={
                            connectionStatus === 'connecting' ||
                            connectionStatus === 'disconnecting'
                        }
                        onClick={() => void connect()}
                    >
                        {connectionStatus === 'connecting'
                            ? 'Connecting...'
                            : connectionStatus === 'disconnecting'
                                ? 'Disconnecting...'
                                : 'Connect provider'}
                    </button>
                )}
            </div>

            <div className="spotify-auth-result">
                <strong>Provider status</strong>
                <p>{connectionStatus}</p>
            </div>

            {track ? (
                <div className="spotify-auth-result spotify-auth-success">
                    <strong>Canonical playback state</strong>

                    <p>
                        {track.title}
                        {' - '}
                        {track.artists
                            .map((artist) => artist.name)
                            .join(', ')}
                    </p>

                    <dl>
                        <dt>Track ID</dt>
                        <dd>{track.id}</dd>

                        <dt>Provider</dt>
                        <dd>{track.provider}</dd>

                        <dt>Provider track ID</dt>
                        <dd>{track.providerTrackId}</dd>

                        <dt>Artist IDs</dt>
                        <dd>
                            {track.artists
                                .map((artist) => artist.id)
                                .join(', ')}
                        </dd>

                        <dt>Status</dt>
                        <dd>{playback.status}</dd>

                        <dt>Position</dt>
                        <dd>{playback.positionMs} ms</dd>

                        <dt>Duration</dt>
                        <dd>{track.durationMs} ms</dd>

                        <dt>Album ID</dt>
                        <dd>{track.album?.id ?? 'Unavailable'}</dd>

                        <dt>Artwork URL</dt>
                        <dd>{track.artwork?.url ?? 'Unavailable'}</dd>
                    </dl>

                    {track.artwork && (
                        <img
                            src={track.artwork.url}
                            alt=""
                            width={160}
                            height={160}
                        />
                    )}

                    <div>
                        <button
                            type="button"
                            onClick={() => void performOperation(
                                () => (
                                    isPlaying
                                        ? provider.pause()
                                        : provider.resume()
                                ),
                            )}
                        >
                            {isPlaying ? 'Pause' : 'Play / Enable audio'}
                        </button>

                        <button
                            type="button"
                            onClick={() => void performOperation(
                                () => provider.previous(),
                            )}
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={() => void performOperation(
                                () => provider.next(),
                            )}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <div className="spotify-auth-result">
                    <strong>No canonical playback state</strong>
                    <p>
                        Connect the provider, then transfer Spotify playback
                        to Resonance from another Spotify client.
                    </p>
                </div>
            )}

            {errorMessage && (
                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Provider operation failed</strong>
                    <p>{errorMessage}</p>
                </div>
            )}
        </section>
    );
}