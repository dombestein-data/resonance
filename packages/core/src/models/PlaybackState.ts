import type { Track } from "./Track";

export interface PlaybackState {
    track: Track | null;

    playing: boolean;
    positionMs: number;
    durationMs: number;

    volume?: number;
}