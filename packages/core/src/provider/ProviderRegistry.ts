import type { MusicProvider } from "./MusicProvider";

/**
 * Stores the music providers available to Resonance at runtime.
 * 
 * Application code should retrieve providers through the registry rather than
 * depending directly on concrete provider implementations.
 */
export class ProviderRegistry {
    private readonly providers = new Map<string, MusicProvider>();

    /**
     * Registers a provider by its unique provider ID.
     * 
     * Duplicate IDs are rejected rather than silently replacing an existing provider
     * as they indicate an invalid application configuration.
     * 
     * @param provider The music provider to register.
     * @throws If another provider with the same ID is already registered.
     */
    register(provider: MusicProvider): void {
        if (this.providers.has(provider.id)) {
            throw new Error(`Provider already registered: ${provider.id}`);
        }

        this.providers.set(provider.id, provider);
    }

    /**
     * Returns a provider registered with the given ID.
     * 
     * @param id The unique provider ID.
     * @returns The registered provider, or `undefined` if no provider has that ID.
     * 
     * @example
     * ```ts
     * const spotify = registry.get('spotify');
     * 
     * if (spotify) {
     *  await spotify.authenticate();
     * }
     * ```
     */
    get(id: string): MusicProvider | undefined {
        return this.providers.get(id);
    }

    /**
     * Returns all providers currently registered with the registry.
     * 
     * The returned array is independent of the registry and may be modified
     * without affecting the registered providers.
     * 
     * @returns The currently registered providers.
     */
    getAll(): MusicProvider[] {
        return Array.from(this.providers.values());
    }

    /**
     * Checks whether a provider with the given ID is registered.
     * 
     * @param id  The unique provider ID.
     * @returns `true` if a provider with that ID is registered; otherwise `false`.
     */
    has(id: string): boolean {
        return this.providers.has(id);
    }
}