/**
 * Canonical representation of artwork associated with a Resonance entity.
 * 
 * Provider implementations are responsible for resolving provider specific
 * artwork data into a directly usable image URL before exposing it to Resonance.
 * 
 * Source selection and responsive artwork sizing are not currently handled by this model.
 */
export interface Artwork {
    /**
     * Directly usable URL for the artwork image.
     */
    url: string;

    /**
     * Width of the artwork image in pixels, when known.
     * 
     * This describes the image resource itself, not the dimensions at which
     * it should be rendered by the UI.
     */
    width?: number;

    /**
     * Height of the artwork image in pixels, when known.
     * 
     * This describes the image resource itself, not the dimensions at which
     * it should be rendered by the UI.
     */
    height?: number;
}