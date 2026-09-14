import type { AlbumSummary } from "./Album";
import type { ArtistSummary } from "./Artist";
import type { Artwork } from "./Artwork";

export interface Track {
    id: string;
    providerId: string;

    title: string;
    artists: ArtistSummary[];
    album?: AlbumSummary;

    durationMs: number;
    artwork?: Artwork;

    playable: boolean;
}