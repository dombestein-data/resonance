const SPOTIFY_SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const SDK_LOAD_TIMEOUT_MS = 20_000;

let sdkLoadPromise: Promise<void> | null = null;

export function loadSpotifySdk(): Promise<void> {
    if (window.Spotify?.Player) {
        return Promise.resolve();
    }

    if (sdkLoadPromise) {
        return sdkLoadPromise;
    }

    sdkLoadPromise = new Promise<void>(
        (resolve, reject) => {
            let settled = false;

            const timeout = window.setTimeout(() => {
                if (settled) {
                    return;
                }

                settled = true;
                sdkLoadPromise = null;

                reject(
                    new Error(
                        '[spotify-playback]: SDK loading timed out',
                    ),
                );
            }, SDK_LOAD_TIMEOUT_MS);

            function finishSuccessfully() {
                if (settled) {
                    return;
                }

                settled = true;
                window.clearTimeout(timeout);
                resolve();
            }

            function fail(error: Error) {
                if (settled) {
                    return;
                }

                settled = true;
                window.clearTimeout(timeout);
                sdkLoadPromise = null;
                reject(error);
            }

            const previousReadyCallback = window.onSpotifyWebPlaybackSDKReady;

            window.onSpotifyWebPlaybackSDKReady = () => {
                previousReadyCallback?.();

                if (!window.Spotify?.Player) {
                    fail(
                        new Error(
                            '[spotify-playback]: SDK callback run, but Spotify.Player is unavailable',
                        ),
                    );

                    return;
                }

                finishSuccessfully();
            };

            const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${SPOTIFY_SDK_URL}"]`);

            if (existingScript) {
                existingScript.addEventListener(
                    'error',
                    () => {
                        fail(
                            new Error(
                                '[spotify-playback]: Spotify SDK script failed to load',
                            ),
                        );
                    },
                    { once: true },
                );

                return;
            }

            const script = document.createElement('script');

            script.src = SPOTIFY_SDK_URL;
            script.async = true;

            script.addEventListener(
                'error',
                () => {
                    fail(
                        new Error(
                            '[spotify-playback]: Spotify SDK script failed to load',
                        ),
                    );
                },
                { once: true },
            );

            document.head.appendChild(script);
        },
    );

    return sdkLoadPromise;
}