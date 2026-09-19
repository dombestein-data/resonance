import type { ReactNode } from "react";
import type { MusicProvider } from "@resonance/core";
import { MusicProviderContext } from "./MusicProviderContext";

interface MusicProviderProviderProps {
  provider: MusicProvider;
  children: ReactNode;
}

export function MusicProviderProvider({
  provider,
  children,
}: MusicProviderProviderProps) {
  return (
    <MusicProviderContext.Provider
      value={{ activeProvider: provider }}
    >
      {children}
    </MusicProviderContext.Provider>
  );
}