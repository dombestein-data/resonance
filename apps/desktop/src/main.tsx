import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ProviderRegistry } from '@resonance/core';
import { MockProvider } from '@resonance/provider-mock';

import App from "./App";
import { MusicProviderProvider } from './providers/MusicProviderProvider';

const registry = new ProviderRegistry();

/**
 * Concrete providers are registered at the application boundary so the
 * rest of the application only depends on the MusicProvider contract.
 */
registry.register(new MockProvider());

const activeProvider = registry.get('mock');
if (!activeProvider) {
  throw new Error ('No active music provider available');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MusicProviderProvider provider={activeProvider}>
      <App />
    </MusicProviderProvider>
  </StrictMode>
)
