/**
 * Canonical summary representation of an artist within Resonance.
 * 
 * Provider implementations are responsible for mapping service-specific
 * artist data into this model before exposing it to Resonance.
 * 
 * This summary contains the information needed when referencing an artist
 * from another canonical model, such as a track.
 * 
 * Artist identity is provider-specific. Resonance does not currently attempt
 * to merge equivalent artists across different providers.
 */
export interface ArtistSummary {
    /**
     * Resonance-wide identifier for this artist.
     * 
     * Combines the originating provider identifier and its provider-local
     * artist ID to create an identifier that is unique across providers.
     * 
     * This identifier represents the artist as exposed by a specific provider.
     * The same real-world artist exposed by different providers therefore has
     * a distinct Resonance ID for each provider.
     * 
     * @example 'apple-music:32940'
     * @example 'spotify:3fMbdgg4jU18AjLCKBhRSm'
     */
    id: string;

    /**
     * Identifier of the provider from which this artist originates.
     * 
     * Resonance can use this value to route provider-specific operations
     * to the correct registered provider.
     * 
     * @example 'apple-music'
     * @example 'spotify'
     */
    provider: string;
 
    /**
     * Identifier assigned to this artist by its originating provider.
     * 
     * @example '32940'
     * @example '3fMbdgg4jU18AjLCKBhRSm'
     */
    providerArtistId: string;

    /**
     * Human-readabøe name of the artist.
     */
    name: string;
}