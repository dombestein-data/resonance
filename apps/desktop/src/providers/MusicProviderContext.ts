import { createContext, useContext } from "react";
import type { MusicProvider } from "@resonance/core";

export interface MusicProviderContextValue {
  /** Every provider registered with the desktop application. */
  providers: readonly MusicProvider[];

  /** Provider currently responsible for application playback operations. */
  activeProvider: MusicProvider;

  providerConnectionStatuses: Readonly<Record<string, ProviderConnectionStatus>>;

  /**
   * Selects an already prepared provider as the active application provider.
   * 
   * Authentication must be completed before selecting providers that require
   * an external account.
   * 
   * @param providerId ID of the provider to mark as active.
   */
  selectProvider(providerId: string): void;

  /**
   * Authenticates, prepares, and activates a registered provider.
   * 
   * @param providerId ID of the providerto connect and activate.
   */
  connectProvider(providerId: string): Promise<void>;

  /**
   * Disconnects a registered provider.
   * 
   * If the provider is currently active, the application switches back to its
   * initla provider before releasing the disconnected provider.
   * 
   * @param providerId ID of the provider to disconnect.
   */
  disconnectProvider(providerId: string): Promise<void>;
}

export type ProviderConnectionStatus =
  | 'disconnecting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export const MusicProviderContext =
  createContext<MusicProviderContextValue | null>(null);

export function useMusicProvider(): MusicProviderContextValue {
  const context = useContext(MusicProviderContext);

  if (!context) {
    throw new Error(
      "useMusicProvider must be used within a MusicProviderProvider",
    );
  }

  return context;
}