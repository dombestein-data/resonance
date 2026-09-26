import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MusicProvider } from "@resonance/core";
import {
  MusicProviderContext,
  type ProviderConnectionStatus,
} from "./MusicProviderContext";

interface MusicProviderProviderProps {
  providers: readonly MusicProvider[];
  initialProviderId: string;
  children: ReactNode;
}

export function MusicProviderProvider({
  providers,
  initialProviderId,
  children,
}: MusicProviderProviderProps) {
  const [activeProviderId, setActiveProviderId] =
    useState(() => {
      const initialProvider = providers.find(
        (provider) => provider.id === initialProviderId,
      );

      if (!initialProvider) {
        throw new Error(
          `Initial music provider is not registered: ${initialProviderId}`,
        );
      }

      return initialProvider.id;
    });

  const [providerConnectionStatuses, setProviderConnectionStatuses] =
    useState<Record<string, ProviderConnectionStatus>>(() => {
      return Object.fromEntries(
        providers.map((provider) => [
          provider.id,
          provider.id === initialProviderId
            ? 'connected'
            : 'disconnected',
        ]),
      );
    });

  const getProvider = useCallback(
    (providerId: string): MusicProvider => {
      const provider = providers.find(
        (candidate) => candidate.id === providerId,
      );

      if (!provider) {
        throw new Error(
          `Music provider is not registered: ${providerId}`,
        );
      }

      return provider;
    },
    [providers],
  );

  const activeProvider = providers.find(
    (provider) => provider.id === activeProviderId,
  );

  if (!activeProvider) {
    throw new Error(
      `Active music provider is not registered: ${activeProviderId}`,
    );
  }

  const selectProvider = useCallback(
    (providerId: string) => {
      const provider = getProvider(providerId);

      const connectionStatus = providerConnectionStatuses[provider.id];

      if (connectionStatus !== 'connected') {
        throw new Error(
          `Cannot select disconnected music provider: ${provider.id}`,
        );
      }

      setActiveProviderId(provider.id);
    },
    [
      getProvider,
      providerConnectionStatuses,
    ],
  );

  const connectProvider = useCallback(
    async (providerId: string): Promise<void> => {
      const provider = getProvider(providerId);

      setProviderConnectionStatuses((current) => ({
        ...current,
        [provider.id]: 'connecting',
      }));

      try {
        await provider.authenticate();

        setProviderConnectionStatuses((current => ({
          ...current,
          [provider.id]: 'connected',
        })));

        /*
         * Activation of the provider happens here rather than in the calling component.
         * This avoids selecting against connection state captured by an
         * earlier React render.
         */
      } catch (error) {
        setProviderConnectionStatuses((current => ({
          ...current,
          [provider.id]: 'failed',
        })));

        throw error;
      }
    },
    [getProvider],
  );

  const disconnectProvider = useCallback(
    async (providerId: string): Promise<void> => {
      const provider = getProvider(providerId);

      if (provider.id === initialProviderId) {
        throw new Error(
          `Cannot disconnect the fallback music provider: ${provider.id}`,
        );
      }

      setProviderConnectionStatuses((current) => ({
        ...current,
        [provider.id]: 'disconnecting',
      }));

      /*
       * Move away from the provider before releasing its playback
       * session. The initial provider is always available as the
       * application fallback.
       */
      if (activeProviderId === provider.id) {
        setActiveProviderId(initialProviderId);
      }

      try {
        await provider.disconnect();

        setProviderConnectionStatuses((current) => ({
          ...current,
          [provider.id]: 'disconnected',
        }));
      } catch (error) {
        setProviderConnectionStatuses((current) => ({
          ...current,
          [provider.id]: 'failed',
        }));

        throw error;
      }
    },
    [
      activeProviderId,
      getProvider,
      initialProviderId,
    ],
  );

  const contextValue = useMemo(
    () => ({
      providers,
      activeProvider,
      providerConnectionStatuses,
      selectProvider,
      connectProvider,
      disconnectProvider,
    }),
    [
      providers,
      activeProvider,
      providerConnectionStatuses,
      selectProvider,
      connectProvider,
      disconnectProvider,
    ],
  );

  return (
    <MusicProviderContext.Provider value={contextValue}>
      {children}
    </MusicProviderContext.Provider>
  );
}

