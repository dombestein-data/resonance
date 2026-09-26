import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import './App.css';

import { ProviderRegistry } from '@resonance/core';
import { MockProvider } from '@resonance/provider-mock';
import { SpotifyProvider } from '@resonance/provider-spotify';

import App from "./App";
import { MusicProviderProvider } from './providers/MusicProviderProvider';

const registry = new ProviderRegistry();

// Concrete providers are registered at the application boundary so the
// rest of the application only depends on the MusicProvider contract.
registry.register(new MockProvider());

const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() ?? '';

if (spotifyClientId) {
  registry.register(
    new SpotifyProvider(spotifyClientId),
  );
}

const providers = registry.getAll();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MusicProviderProvider
      providers={providers}
      initialProviderId="mock"
    >
      <App />
    </MusicProviderProvider>
  </StrictMode>
)
