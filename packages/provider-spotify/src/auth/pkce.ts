const PKCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function createRandomString(length: number): string {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    return Array.from(
        randomValues,
        (value) => PKCE_ALPHABET[value % PKCE_ALPHABET.length],
    ).join('');
}

function encodeBase64Url(bytes: Uint8Array): string {
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

export interface PkceChallenge {
    verifier: string;
    challenge: string;
}

export async function createPkceChallenge(): Promise<PkceChallenge> {
    const verifier = createRandomString(64);
    const verifierBytes = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', verifierBytes);

    return {
        verifier,
        challenge: encodeBase64Url(new Uint8Array(digest)),
    };
}

export function createOAuthState(): string {
    return createRandomString(32);
}