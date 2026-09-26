import {
    useState,
} from 'react';

import {
    useMusicProvider,
} from '../providers/MusicProviderContext';

export function SpotifyProviderSettings() {
    const {
        providers,
        activeProvider,
        providerConnectionStatuses,
        selectProvider,
        connectProvider,
        disconnectProvider,
    } = useMusicProvider();

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const spotify = providers.find(
        (provider) => provider.id === 'spotify',
    );

    if (!spotify) {
        return (
            <section className="spotify-auth-probe">
                <h2>Spotify</h2>

                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Spotify is unavailable</strong>
                    <span>
                        Configure VITE_SPOTIFY_CLIENT_ID to register the
                        Spotify provider.
                    </span>
                </div>
            </section>
        );
    }

    const spotifyProviderId = spotify.id;
    const connectionStatus =
        providerConnectionStatuses[spotifyProviderId] ??
        'disconnected';

    const isActive = activeProvider.id === spotifyProviderId;
    const isConnected = connectionStatus === 'connected';
    const isBusy =
        connectionStatus === 'connecting' ||
        connectionStatus === 'disconnecting';

    async function connect() {
        setErrorMessage(null);

        try {
            await connectProvider(spotifyProviderId);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    async function activate() {
        setErrorMessage(null);

        try {
            selectProvider(spotifyProviderId);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    async function disconnect() {
        setErrorMessage(null);

        try {
            await disconnectProvider(spotifyProviderId);
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : String(error),
            );
        }
    }

    return (
        <section className="spotify-auth-probe">
            <div className="spotify-auth-header">
                <div>
                    <h2>Spotify</h2>
                    <p>
                        Connect Spotify and use it as Resonance&apos;s active
                        music provider.
                    </p>
                </div>

                {!isConnected ? (
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void connect()}
                    >
                        {connectionStatus === 'connecting'
                            ? 'Connecting...'
                            : connectionStatus === 'disconnecting'
                                ? 'Disconnecting...'
                                : 'Connect Spotify'}
                    </button>
                ) : isActive ? (
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void disconnect()}
                    >
                        Disconnect Spotify
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void activate()}
                    >
                        Use Spotify
                    </button>
                )}
            </div>

            <div
                className={[
                    'spotify-auth-result',
                    isConnected
                        ? 'spotify-auth-success'
                        : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <strong>
                    {isActive
                        ? 'Spotify is active'
                        : isConnected
                            ? 'Spotify is connected'
                            : 'Spotify is not connected'}
                </strong>

                <span>
                    Connection status: {connectionStatus}
                </span>
            </div>

            {errorMessage && (
                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Spotify operation failed</strong>
                    <span>{errorMessage}</span>
                </div>
            )}
        </section>
    );
}