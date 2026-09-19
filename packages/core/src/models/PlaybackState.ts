import type { Track } from "./Track";

/**
 * Describes the current playback status reported by a music provider.
 * 
 * `idle` represents the absence of an active playback item. Other statuses
 * describe the state of a loaded track.
 * 
 * Additional statuses may be introduced if provider implementations expose
 * playback states that Resonance needs to distinguish.
 */
export type PlaybackStatus =
    | 'idle'
    | 'playing'
    | 'paused'
    | 'buffering';

/**
 * Canonical representation of the current playback state within Resonance.
 * 
 * Provider implementations are responsible for translating provider-specific
 * playback information into this model before exposing it to Resonance.
 * 
 * When no track is loaded, `track` must be `null`, `status` must be `idle`,
 * and `positionMs` must be `0`.
 * 
 * Track duration is provided by {@link Track.durationMs} rather than duplicated in
 * the playback state. A playback-specific duration may be introduced in the
 * future if providers expose a meaningful distinction between playback
 * duration and canonical track metadata.
 */
export interface PlaybackState {
    /**
     * Track currently loaded for playback.
     * 
     * A paused or buffering track remains loaded. `null` indicates that no
     * track is currently loaded and therefore requires an `idle` status.
     */
    track: Track | null;

    /**
     * Current playback status.
     */
    status: PlaybackStatus;

    /**
     * Current playback position in milliseconds.
     * 
     * Must be `0` when no track is loaded.
     */
    positionMs: number;

    /**
     * Playback volume reported by the provider, when available.
     * 
     * Values are normalized to the range `0.0` to `1.0` where `0.0` 
     * represents silence and `1.0` represents maximum volume.
     * 
     * Providers that do not expose playback volume should omit this value.
     */
    volume?: number;
}