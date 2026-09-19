import { createContext, useContext } from "react";
import type { MusicProvider } from "@resonance/core";

export interface MusicProviderContextValue {
  activeProvider: MusicProvider;
}

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