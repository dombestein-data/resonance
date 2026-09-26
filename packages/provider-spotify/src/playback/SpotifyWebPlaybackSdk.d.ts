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

        interface WebPlaybackAlbum {
            name: string;
            uri: string;
            images: WebPlaybackImage[];
        }

        interface WebPlaybackTrack {
            name: string;
            uri: string;
            artists: WebPlaybackArtist[];
            id: string | null;
            type: 'track' | 'episode' | 'ad' | string;
            media_type: 'audio' | 'video' | string;
            is_playable: boolean;
            album: WebPlaybackAlbum;
        }

        interface WebPlaybackTrackWindow {
            current_track: WebPlaybackTrack;
            previous_tracks: WebPlaybackTrack[];
            next_tracks: WebPlaybackTrack[];
        }

        interface WebPlaybackState {
            context: {
                uri: string | null;
                metadata: Record<string, unknown> | null;
            };

            disallows: Record<string, boolean>;

            duration: number;
            paused: boolean;
            position: number;
            repeat_mode: number;
            shuffle: boolean;
            timestamp: number;

            track_window: WebPlaybackTrackWindow;
        }

        interface WebPlaybackImage {
            url: string;
            height?: number | null;
            width?: number | null;
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
                callback: (state: WebPlaybackState | null) => void,
            ): boolean;

            connect(): Promise<boolean>;
            disconnect(): void;
            activateElement(): Promise<void>;
            pause(): Promise<void>;
            resume(): Promise<void>;
            togglePlay(): Promise<void>;

            seek(positionMs: number): Promise<void>;
            previousTrack(): Promise<void>;
            nextTrack(): Promise<void>;

            getVolume(): Promise<number>;
            setVolume(volume: number): Promise<void>;
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