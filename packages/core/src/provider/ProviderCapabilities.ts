/**
 * Describes the functionality exposed by a music provider implementation.
 * 
 * Capabilities represent functionality that the provider can expose through
 * Resonance, rather than every feature supported by the underlying music service.
 * Even though a capability is marked as true for a given provider, it does not
 * guarantee that an operation is currently available for a particular user, resource,
 * authentication state, or playback session.
 * 
 * Consumers should use capabilities to determine which functionality is
 * available instead of checking for specific provider IDs.
 * 
 * A provider must not advertise a capability that the current Resonance Core
 * cannot consume.
 */
export interface ProviderCapabilities {
    /**
     * Playback operations supported by the provider.
     */
    playback: PlaybackCapabilities;

    /**
     * Whether the provider supports searching its catalog or available content.
     */
    search: boolean;

    /**
     * Library operations supported by the provider.
     */
    library: LibraryCapabilities;

    /**
     * Playlist operations supported by the provider.
     */
    playlists: PlaylistCapabilities;

    /**
     * Queue operations supported by the provider.
     */
    queue: QueueCapabilities;

    /**
     * Whether the provider can expose lyrics content to Resonance.
     * 
     * Merely reporting whether lyrics exist does not constitute lyrics support.
     */
    lyrics: boolean;

    /**
     * Whether the provider can expose provider-generated recommendations.
     * 
     * This refers to recommendation functionality provided by the underlying
     * service, rather than recommendations generated independently by Resonance.
     */
    recommendations: boolean;

    /**
     * Favorite operations supported by the provider.
     * 
     * Favorites are distinct from ordinary library membership and represent an
     * explicit provider-supported preference or favorite state.
     */
    favorites: FavoriteCapabilities;
}

/**
 * Describes playback operations supported by a provider.
 */
export interface PlaybackCapabilities {
    playTrack: boolean;
    resume: boolean;
    pause: boolean;
    seek: boolean;
    next: boolean;
    previous: boolean;
    volume: boolean;
    shuffle: boolean;
    repeat: boolean;
}

/**
 * Describes library operations supported by a provider.
 */
export interface LibraryCapabilities {
    read: boolean;
    add: boolean;
    remove: boolean;
}

/** 
 * Describes playlist operations supported by a provider.
 */
export interface PlaylistCapabilities {
    read: boolean;
    create: boolean;
    update: boolean;
    addItems: boolean;
    removeItems: boolean;
    reorderItems: boolean;
    delete: boolean;
}

/**
 * Describes queue operations supported by a provider.
 */
export interface QueueCapabilities {
    read: boolean;
    add: boolean;
    remove: boolean;
    reorder: boolean;
    clear: boolean;
}

/**
 * Describes favorite operations supported by a provider.
 * 
 * Favorites are modeled separately from library membership because some
 * providers distinguish between saving an item and marking it as a favorite.
 */
export interface FavoriteCapabilities {
    read: boolean;
    add: boolean;
    remove: boolean;
}