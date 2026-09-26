import { invoke } from '@tauri-apps/api/core';

import {
    createOAuthState,
    createPkceChallenge,
} from './pkce';

import type {
    SpotifyToken,
    SpotifyTokenResponse,
} from './SpotifyToken';

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const REDIRECT_URI = 'http://127.0.0.1:43821/callback';

const DEFAULT_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
];

export class SpotifyAuthClient {
    private token: SpotifyToken | null = null;

    constructor(private readonly clientId: string) {
        if (!clientId.trim()) {
            throw new Error(
                '[spotify-auth]: Spotify client ID is missing',
            );
        }
    }

    get currentToken(): SpotifyToken | null {
        return this.token;
    }

    get isAuthenticated(): boolean {
        return (
            this.token !== null &&
            Date.now() < this.token.expiresAt
        );
    }

    async authenticate(): Promise<SpotifyToken> {
        const { verifier, challenge } = await createPkceChallenge();

        const expectedState = createOAuthState();

        const authorizationUrl =
            this.createAuthorizationUrl(
                challenge,
                expectedState,
            );

        /*
        * The tauri command:
        *
        * 1. Starts the loopback callback listener
        * 2. Opens the system browser
        * 3. Waits for Spotify to redirect back
        * 4. Returns the complete callback URL
        */

        const callbackUrl = await invoke<string>(
            'spotify_authorize',
            {
                authorizationUrl,
            },
        );

        const callback = new URL(callbackUrl);

        const returnedState = callback.searchParams.get('state');

        if (returnedState !== expectedState) {
            throw new Error(
                '[spotify-auth]: OAuth state mismatch',
            );
        }

        const authorizationError = callback.searchParams.get('error');

        if (authorizationError) {
            throw new Error(
                `[spotify-auth]: Spotify authorization failed: ${authorizationError}`,
            );
        }

        const authorizationCode = callback.searchParams.get('code');

        if (!authorizationCode) {
            throw new Error(
                '[spotify-auth]: Spotify did not return an authorization code',
            );
        }

        this.token = await this.exchangeCode(
            authorizationCode,
            verifier,
        );

        return this.token;
    }

    disconnect(): void {
        this.token = null;
    }

    private createAuthorizationUrl(
        challenge: string,
        state: string,
    ): string {
        const parameters = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            code_challenge_method: 'S256',
            code_challenge: challenge,
            state,
            scope: DEFAULT_SCOPES.join(' '),
        });

        return `${SPOTIFY_AUTHORIZE_URL}?${parameters.toString()}`;
    }

    private async exchangeCode(
        authorizationCode: string,
        verifier: string,
    ): Promise<SpotifyToken> {
        const body = new URLSearchParams({
            client_id: this.clientId,
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: REDIRECT_URI,
            code_verifier: verifier,
        });

        const response = await fetch(
            SPOTIFY_TOKEN_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded',
                },
                body,
            },
        );

        if (!response.ok) {
            const responseBody = await response.text();

            throw new Error(
                `[spotify-auth]: Token exchange failed with HTTP ${response.status}: ${responseBody}`,
            );
        }

        const result = (await response.json()) as SpotifyTokenResponse;

        if (!result.access_token) {
            throw new Error(
                '[spotify-auth]: Token response did not contain an access token',
            );
        }

        return {
            accessToken: result.access_token,
            tokenType: result.token_type,
            scope: result.scope,
            refreshToken: result.refresh_token,

            /*
            * Subtract 30 seconds so we do not attempt to use 
            * a token immediately before Spotify expires it.
            */
           expiresAt:
            Date.now() +
            Math.max(0, result.expires_in - 30) * 1000,
        };
    }
}