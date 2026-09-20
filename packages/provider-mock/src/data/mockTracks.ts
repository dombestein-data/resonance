import type { Track } from "@resonance/core";

export const mockTracks: Track[] = [
  {
    id: "mock:track:midnight-signals",
    provider: "mock",
    providerTrackId: "track:midnight-signals",
    title: "Midnight Signals",
    artists: [
      {
        id: "mock:artist:1",
        provider: "mock",
        providerArtistId: "artist:1",
        name: "The Test Fixtures",
      },
    ],
    album: {
      id: "mock:album:1",
      provider: "mock",
      providerAlbumId: "album:1",
      title: "Definitely Real Music",
    },
    durationMs: 213_000,
    playable: true,
  },

  {
    id: "mock:track:architecture-reckoning",
    provider: "mock",
    providerTrackId: "track:architecture-reckoning",
    title: "Architecture: The Reckoning",
    artists: [
      {
        id: "mock:artist:2",
        provider: "mock",
        providerArtistId: "artist:2",
        name: "Runtime Error",
      },
    ],
    album: {
      id: "mock:album:2",
      provider: "mock",
      providerAlbumId: "album:2",
      title: "Works On My Machine",
    },
    durationMs: 247_000,
    playable: true,
  },

  {
    id: "mock:track:broken-shadows",
    provider: "mock",
    providerTrackId: "track:broken-shadows",
    title: "Broken Shadows",
    artists: [
      {
        id: "mock:artist:3",
        provider: "mock",
        providerArtistId: "artist:3",
        name: "Fincore",
      },
    ],
    album: {
      id: "mock:album:3",
      provider: "mock",
      providerAlbumId: "album:3",
      title: "Broken Shadows",
    },
    durationMs: 173_000,
    playable: true,
  },
];