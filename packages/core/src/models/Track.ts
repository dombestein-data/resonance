import type { AlbumSummary } from "./Album";
import type { ArtistSummary } from "./Artist";
import type { Artwork } from "./Artwork";

/**
 * Canonical representation of a track within Resonance.
 * 
 * Provider implementations are responsible for mapping service-specific track data
 * into this model before exposing it to Resonance.
 * 
 * Track identity is provider-specific. Resonance does not currently attempt
 * to merge equivalent tracks across different providers.
 */
export interface Track {
    /**
     * Resonance-wide identifier for this track.
     * 
     * Combines the originating provider identifier and its provider-local
     * track ID to create an identifier that is unique across providers.
     * 
     * This identifier represents the track as exposed by a specific provider.
     * The same real-world recording exposed by different providers therefore has
     * a distinct Resonance ID for each provider.
     * 
     * @example 'apple-music:269573405'
     * @example 'spotify:4cgjA7B4fJBHyB9Ya2bu0t'
     */
    id: string;

    /**
     * Identifier of the provider from which this track originates.
     * 
     * Resonance can use this value to route provider-specific operations
     * to the correct registered provider.
     * 
     * @example 'apple-music'
     * @example 'spotify'
     */
    provider: string;

    /**
     * Identifier assigned to this track by its originating provider.
     * 
     * This value is passed to provider-specific operations such as
     * requesting playback through the originating provider.
     * 
     * @example '269573405'
     * @example '4cgjA7B4fJBHyB9Ya2bu0t'
     */
    providerTrackId: string;

    /**
     * Human-readable title of the track.
     */
    title: string;

    /**
     * Artists credited on the track, preserving the provider's ordering
     * where available.
     */
    artists: ArtistSummary[];

    /**
     * Album containing the track, when available.
     */
    album?: AlbumSummary;

    /**
     * Duration of the track in milliseconds.
     */
    durationMs: number;
    
    /**
     * Artwork associated with the track, when available.
     */
    artwork?: Artwork;

    /**
     * Indicates whether the track can currently be played through its
     * originating provider.
     */
    playable: boolean;
}