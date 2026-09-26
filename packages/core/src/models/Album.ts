import type { Artwork } from "./Artwork";

/**
 * Canonical summary representation of a provider-backed album within Resonance.
 * 
 * Provider implementations are responsible for mapping service-specific
 * album data into this model before exposing it to Resonance.
 * 
 * This summary contains the information needed when referencing an album
 * from another canonical model, such as a track.
 * 
 * Album identity is provider-specific. Resonance does not currently attempt
 * to merge equivalent albums across different providers.
 */
export interface AlbumSummary {
    /**
     * Resonance-wide identifier for this provider-backed album.
     *
     * Uses the form:
     * `provider:resource-type:provider-local-id`
     *
     * Including the resource type prevents identifiers belonging to different
     * resource categories from colliding within the same provider.
     *
     * This identifier represents the album as exposed by a specific provider.
     * The same real-world album exposed by different providers therefore has
     * a distinct Resonance ID for each provider.
     * 
     * @example 'apple-music:album:269572838'
     * @example 'spotify:album:2ANVost0y2y52ema1E9xAZ'
     */
    id: string;

    /**
     * Identifier of the provider from which this album originates.
     * 
     * Resonance can use this value to route provider-specific operations
     * to the correct registered provider.
     * 
     * @example 'apple-music'
     * @example 'spotify'
     */
    provider: string;

    /**
     * Identifier assigned to this album by its originating provider.
     * 
     * @example '269572838'
     * @example '2ANVost0y2y52ema1E9xAZ'
     */
    providerAlbumId: string;

    /**
     * Human-readable title of the album.
     */
    title: string;

    /**
     * Artwork associated with the album, when available.
     */
    artwork?: Artwork;
}
