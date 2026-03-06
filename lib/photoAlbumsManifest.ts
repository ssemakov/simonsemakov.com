export interface PhotoManifestEntry {
  src?: string;
  path?: string;
  width: number;
  height: number;
  alt?: string;
  title?: string;
  description?: string;
}

export interface PhotoAlbumManifestEntry {
  slug: string;
  title: string;
  description: string;
  coverPhotoIndex?: number;
  photos: PhotoManifestEntry[];
}

// Update this manifest to add/remove albums and photos.
// `path` values are resolved against NEXT_PUBLIC_GUMLET_DELIVERY_URL.
export const photoAlbumsManifest: PhotoAlbumManifestEntry[] = [
  {
    slug: "istanbul",
    title: "Istanbul",
    description: "Scenes from springtime in Istanbul across the Bosphorus.",
    coverPhotoIndex: 0,
    photos: [
      {
        path: "istanbul/IMG_8263-HDR.jpg",
        width: 2048,
        height: 1365,
        alt: "Blue Mosque skyline at sunset in Istanbul",
        description:
          "Dusk settles over Sultanahmet and the historic skyline of Istanbul.",
      },
      {
        path: "albums/istanbul/istanbul-grand-bazaar-lanterns.jpg",
        width: 2048,
        height: 1365,
        alt: "Lanterns hanging in the Grand Bazaar",
        description:
          "Lantern merchants inside the Grand Bazaar glow with warm colors.",
      },
      {
        path: "albums/istanbul/istanbul-galata-bridge-fishermen.jpg",
        width: 2048,
        height: 1366,
        alt: "Fishermen on the Galata Bridge",
        description:
          "Morning fishermen line the Galata Bridge as ferries cross the Bosphorus.",
      },
      {
        path: "albums/istanbul/istanbul-spice-market-stalls.jpg",
        width: 2048,
        height: 1280,
        alt: "Spice Market stalls in Istanbul",
        description:
          "Spice Market stalls overflow with colors and textures in Eminonu.",
      },
      {
        path: "albums/istanbul/istanbul-maidens-tower-sunset.jpg",
        width: 2048,
        height: 1365,
        alt: "View of the Bosphorus and Maiden's Tower",
        description:
          "The Maiden's Tower stands against a hazy Bosphorus sunset.",
      },
    ],
  },
];
