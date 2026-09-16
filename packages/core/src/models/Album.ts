import type { Artwork } from "./Artwork";

export interface AlbumSummary {
    id: string;
    providerId: string;
    title: string;
    artwork?: Artwork;
}