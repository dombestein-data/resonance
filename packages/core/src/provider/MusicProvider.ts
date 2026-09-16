import type { Track } from "../models/Track";
import type { PlaybackState } from "../models/PlaybackState";
import type { ProviderCapabilities } from "./ProviderCapabilities";

export interface SearchResults {
    tracks: Track[];
}

export interface MusicProvider {
    readonly id: string;
    readonly name: string;
    readonly capabilities: ProviderCapabilities;

    authenticate(): Promise<void>;
    disconnect(): Promise<void>;

    getPlaybackState(): Promise<PlaybackState | null>;

    playTrack(trackId: string): Promise<void>;
    resume(): Promise<void>;
    pause(): Promise<void>;
    next(): Promise<void>;
    previous(): Promise<void>;

    search(query: string): Promise<SearchResults>;
}