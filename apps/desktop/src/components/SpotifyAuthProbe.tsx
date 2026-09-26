import { 
    useMemo, 
    useState,
    useEffect,
 } from 'react';

import {
    SpotifyAuthClient,
    SpotifyPlaybackClient,
    SpotifyPlaybackError,
    type SpotifyNowPlayingState,
    type SpotifyToken,
} from '@resonance/provider-spotify';


type AuthenticationStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'failed';

type PlaybackStatus =
    | 'idle'
    | 'loading-sdk'
    | 'ready'
    | 'failed';

export function SpotifyAuthProbe() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? '';

    const authClient = useMemo(
        () =>
            clientId
                ? new SpotifyAuthClient(clientId)
                : null,
        [clientId],
    );

    const playbackClient = useMemo(
        () => new SpotifyPlaybackClient(),
        [],
    );


    const [status, setStatus] = useState<AuthenticationStatus>('idle');
    const [token, setToken] = useState<SpotifyToken | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [audioActivationError, setAudioActivationError] = useState<string | null>(null);
    const [ nowPlaying, setNowPlaying ] = useState<SpotifyNowPlayingState | null>(null);
    const [ playbackControlError, setPlaybackControlError ] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = playbackClient.subscribeToState(
            setNowPlaying,
        );

        return () => {
            unsubscribe();
            playbackClient.disconnect();
        };
    }, [playbackClient]);

    async function connect() {
        if (!authClient) {
            setStatus('failed');
            setError(
                'VITE_SPOTIFY_CLIENT_ID is not configured.',
            );

            return;
        }

        setStatus('connecting');
        setError(null);

        playbackClient.disconnect();
        setDeviceId(null);
        setPlaybackStatus('idle');
        setPlaybackError(null);
        setAudioEnabled(false);
        setAudioActivationError(null);
        setNowPlaying(null);
        setPlaybackControlError(null);

        try {
            const authenticatedToken = await authClient.authenticate();
            setToken(authenticatedToken);
            setStatus('connected');
        } catch (caughtError) {
            const message =
                caughtError instanceof Error
                    ? caughtError.message
                    : String(caughtError);

            setToken(null);
            setStatus('failed');
            setError(message);
        }
    }

    async function initializePlayer() {
        if (!token) {
            setPlaybackStatus('failed');
            setPlaybackError('Authenticate with Spotify before initializing the player.');

            return;
        }

        setDeviceId(null);
        setPlaybackStatus('loading-sdk');
        setPlaybackError(null);
        setAudioEnabled(false);
        setAudioActivationError(null);
        setNowPlaying(null);
        setPlaybackControlError(null);

        try {
            const connection = await playbackClient.connect(token.accessToken);

            setDeviceId(connection.deviceId);
            setPlaybackStatus('ready');
        } catch (caughtError) {
            setPlaybackStatus('failed');

            if (caughtError instanceof SpotifyPlaybackError) {
                setPlaybackError(`${caughtError.kind}: ${caughtError.message}`);
            } else {
                setPlaybackError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : String(caughtError),
                );
            }
        }
    }

    async function enableAudio() {
        setAudioActivationError(null);

        try {
            /*
            * WebKit uses this user gesture to permit playback.
            */
            await playbackClient.activateElement();
            setAudioEnabled(true);
        } catch (caughtError) {
            setAudioEnabled(false);

            setAudioActivationError(
                caughtError instanceof Error
                    ? caughtError.message
                    : String(caughtError),
            );
        }
    }

    async function togglePlayback() {
        if (!nowPlaying) {
            return;
        }

        setPlaybackControlError(null);

        try {
            if (nowPlaying.paused) {
                await playbackClient.resume();
            } else {
                await playbackClient.pause();
            }
        } catch (caughtError) {
            setPlaybackControlError(
                caughtError instanceof Error
                    ? caughtError.message
                    : String(caughtError),
            );
        }
    }

    function disconnect() {
        playbackClient.disconnect();
        authClient?.disconnect();

        setToken(null);
        setDeviceId(null);
        setError(null);
        setPlaybackError(null);
        setPlaybackStatus('idle');
        setStatus('idle');
        setAudioEnabled(false);
        setAudioActivationError(null);
        setNowPlaying(null);
        setPlaybackControlError(null);
    }

    return (
        <section className="spotify-auth-probe">
            <div className="spotify-auth-header">
                <div>
                    <h2>Spotify Authentication</h2>

                    <p>
                        Connect Resonance through Spotify&apos;s
                        Authorization Code flow with PKCE.
                    </p>
                </div>

                {status === 'connected' ? (
                    <button
                        type="button"
                        onClick={disconnect}
                    >
                        Disconnect account
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={connect}
                        disabled={
                            status === 'connecting' || !authClient
                        }
                    >
                        {status === 'connecting'
                            ? 'Waiting for Spotify...'
                            : 'Connect Spotify account'}
                    </button>
                )}
            </div>

            {!clientId && (
                <p className="spotify-auth-message spotify-auth-error">
                    Spotify client ID is not configured. Add
                    VITE_SPOTIFY_CLIENT_ID to
                    apps/desktop/.env.local and restart Resonance.
                </p>
            )}

            {status === 'connected' && token && (
                <div className="spotify-auth-result spotify-auth-success">
                    <strong>Spotify connected</strong>

                    <span>
                        Token expires at{' '}
                        {new Date(token.expiresAt).toLocaleTimeString()}
                    </span>

                    <span>
                        Refresh token received:{' '}
                        {token.refreshToken ? 'Yes' : 'No'}
                    </span>

                    <span>
                        Granted scopes: {token.scope || 'Not reported'}
                    </span>
                </div>
            )}

            {status === 'connected' && (
                <div className="spotify-player-probe">
                    <div>
                        <strong>Web Playback SDK</strong>

                        <p>
                            Initialize a Spotify Connect device
                            inside Resonance.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={initializePlayer}
                        disabled={playbackStatus === 'loading-sdk'}
                    >
                        {playbackStatus === 'loading-sdk'
                            ? 'Initializing player...'
                            : playbackStatus === 'ready'
                                ? 'Initialize again'
                                : 'Initialize player'}
                    </button>

                    {playbackStatus === 'ready' && (
                        <div className="spotify-now-playing">
                            <div className="spotify-now-playing-details">
                                <span className="spotify-now-playing-label">
                                    Now Playing
                                </span>

                                {nowPlaying ? (
                                    <strong>
                                        {nowPlaying.trackName} 
                                        {' - '}
                                        {nowPlaying.artistNames.join(', ')}
                                    </strong>
                                ) : (
                                    <span className="spotify-now-playing-empty">
                                        Waiting for playback...
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={togglePlayback}
                                disabled={!nowPlaying}
                            >
                                {nowPlaying?.paused
                                    ? 'Play'
                                    : 'Pause'}
                            </button>

                            {playbackControlError && (
                                <span className="spotify-now-playing-error">
                                    {playbackControlError}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {playbackStatus === 'ready' && deviceId && (
                <div className="spotify-auth-result spotify-auth-success">
                    <strong>Spotify player ready</strong>

                    <span>
                        Device ID: {deviceId}
                    </span>

                    <button
                        type="button"
                        className="spotify-enable-audio"
                        onClick={enableAudio}
                        disabled={audioEnabled}
                    >
                        {audioEnabled
                            ? 'Audio enabled'
                            : 'Enable audio'}
                    </button>

                    {audioActivationError && (
                        <span className="spotify-audio-error">
                            {audioActivationError}
                        </span>
                    )}
                </div>
            )}

            {playbackStatus === 'failed' && playbackError && (
                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Spotify player failed</strong>
                    <span>{playbackError}</span>
                </div>
            )}

            {status === 'failed' && error && (
                <div className="spotify-auth-result spotify-auth-error">
                    <strong>Spotify connection failed</strong>
                    <span>{error}</span>
                </div>
            )}

            <p className="spotify-auth-note">
                Authentication tokens and the Spotify player
                exist in memory only. Closing Resonance clears
                them.
            </p>
        </section>
    );
}
