import type { Track } from "../models/Track";
import type { PlaybackState } from "../models/PlaybackState";
import type { ProviderCapabilities } from "./ProviderCapabilities";

/**
 * Results returned by a provider search.
 * 
 * This interface can be extended as Resonance gains support for searching
 * additional resource types such as albums, artists, and playlists.
 */
export interface SearchResults {
    tracks: Track[];
}

/**
 * Determines how playback repeats within the current playback context.
 * 
 * - `off` disables repeating.
 * - `context` repeats the current playback context, such as an album or playlist.
 * - `track` repeats the currently playing track.
 */
export type RepeatMode =
    | 'off'
    | 'context'
    | 'track';

/**
 * Defines the common contract implemented by all Resonance music providers.
 * 
 * Provider implementations are responsible for translating service-specific APIs,
 * data, authentication, and playback behavior into Resonance's 
 * provider-agnostic models and operations.
 * 
 * Consumers should interact with providers through this interface rather than
 * depending on a concrete provider implementation.
 */
export interface MusicProvider {
    /**
     * Stable identifier used by Resonance to register and select this provider.
     * 
     * @example 'spotify'
     * @example 'apple-music'
     * @example 'mock'
     */
    readonly id: string;

    /**
     * Human-readable name of the provider.
     * 
     * @example 'Spotify'
     * @example 'Apple Music'
     */
    readonly name: string;

    /**
     * Describes the functionality implemented by this provider and exposed
     * through Resonance.
     * 
     * Consumers should check provider capabilities when deciding whether a
     * feature is available rather than checking the provider's ID.
     */
    readonly capabilities: ProviderCapabilities;

    /**
     * Prepares the provider for use, performing authentication when required.
     * 
     * Authentication details are owned by the provider implementation and
     * should not need to be handled by consumers of this interface.
     * 
     * Providers that do not require authentication may implement this 
     * as a no-op.
     * 
     * @throws If the provider cannot be prepared for use.
     */
    authenticate(): Promise<void>;

    /**
     * Disconnects from the provider and releases any provider-specific session
     * or authentication state.
     */
    disconnect(): Promise<void>;

    /**
     * Returns the provider's current playback state.
     * 
     * An `idle` playback state indicates that the provider has no track loaded.
     * `null` indicates that the playback state is not currently available.
     * 
     * @returns The current playback state, or `null` if no playback state is available.
     */
    getPlaybackState(): Promise<PlaybackState | null>;

    /**
     * Starts playback of a specific track.
     * 
     * Unlike {@link resume}, this selects a track for playback rather than
     * continuing the existing playback session.
     * 
     * Provider routing is handled by Resonance before this method is called.
     * Implementations therefore receive the identifier understood by their own service.
     * 
     * @param providerTrackId The provider-local ID of the track to play.
     * @throws If the requested track cannot be found or played.
     */
    playTrack(providerTrackId: string): Promise<void>;

    /**
     * Resumes the current playback session.
     */
    resume(): Promise<void>;

    /**
     * Pauses the current playback session.
     */
    pause(): Promise<void>;

    /**
     * Seeks to a position within the currently loaded track.
     * 
     * @param positionMs The target playback position in milliseconds.
     * @throws If `positionMs` is negative.
     */
    seek(positionMs: number): Promise<void>;

    /**
     * Advances to the next track in the current playback context.
     */
    next(): Promise<void>;

    /**
     * Returns playback to the previous track in the current playback context.
     */
    previous(): Promise<void>;

    /**
     * Sets the provider playback volume.
     * 
     * @param volume The desired volume, normalized from `0.0` to `1.0`.
     * @throws If `volume` is outside the range `0.0` to `1.0`.
     */
    setVolume(volume: number): Promise<void>;

    /**
     * Enables or disables shuffle for the current playback context.
     * 
     * @param enabled Whether shuffle should be enabled.
     */
    setShuffle(enabled: boolean): Promise<void>;

    /**
     * Sets the provider repeat mode.
     * 
     * @param mode The desired mode as defined in {@link RepeatMode}.
     */
    setRepeatMode(mode: RepeatMode): Promise<void>;

    /**
     * Searches the provider and returns results mapped to Resonance's canonical models.
     * 
     * @param query The search query.
     * @returns Search results provided by the provider.
     */
    search(query: string): Promise<SearchResults>;
}