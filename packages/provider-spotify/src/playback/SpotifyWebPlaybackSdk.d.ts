export {};

declare global {
    namespace Spotify {
        interface PlayerInitialization {
            name: string;
            getOAuthToken(
                callback: (accessToken: string) => void,
            ): void;
            volume?: number;
            enableMediaSession?: boolean;
        }

        interface WebPlaybackPlayer {
            device_id: string;
        }

        interface WebPlaybackArtist {
            name: string;
            uri: string;
        }

        interface WebPlaybackTrack {
            name: string;
            uri: string;
            artists: WebPlaybackArtist[];
        }

        interface WebPlaybackState {
            paused: boolean;
            position: number;
            duration: number;

            track_window: {
                current_track: WebPlaybackTrack;
            };
        }

        interface ErrorEvent {
            message: string;
        }

        interface Player {
            addListener(
                event: 'ready' | 'not_ready',
                callback: (
                    state: WebPlaybackPlayer,
                ) => void,
            ): boolean;

            addListener(
                event:
                    | 'initialization_error'
                    | 'authentication_error'
                    | 'account_error'
                    | 'playback_error',
                callback: (error: ErrorEvent) => void,
            ): boolean;

            addListener(
                event: 'autoplay_failed',
                callback: () => void,
            ): boolean;

            addListener(
                event: 'player_state_changed',
                callback: (
                    state: WebPlaybackState | null,
                ) => void,
            ): boolean;

            connect(): Promise<boolean>;
            disconnect(): void;
            activateElement(): Promise<void>;
            pause(): Promise<void>;
            resume(): Promise<void>;
        }

        const Player: {
            new (
                initialization:
                    PlayerInitialization,
            ): Player;
        };
    }

    interface Window {
        Spotify?: typeof Spotify;

        onSpotifyWebPlaybackSDKReady?: () => void;
    }
}