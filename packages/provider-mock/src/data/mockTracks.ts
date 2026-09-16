import type { Track } from "@resonance/core";

export const mockTracks: Track[] = [
  {
    id: "mock:track:midnight-signals",
    providerId: "mock",
    title: "Midnight Signals",
    artists: [
      {
        id: "mock:artist:1",
        providerId: "mock",
        name: "The Test Fixtures",
      },
    ],
    album: {
      id: "mock:album:1",
      providerId: "mock",
      title: "Definitely Real Music",
    },
    durationMs: 213_000,
    playable: true,
  },

  {
    id: "mock:track:architecture-reckoning",
    providerId: "mock",
    title: "Architecture: The Reckoning",
    artists: [
      {
        id: "mock:artist:2",
        providerId: "mock",
        name: "Runtime Error",
      },
    ],
    album: {
      id: "mock:album:2",
      providerId: "mock",
      title: "Works On My Machine",
    },
    durationMs: 247_000,
    playable: true,
  },
];