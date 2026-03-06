export interface PhotoMetadata {
  src: string;
  width: number;
  height: number;
  alt?: string;
  title?: string;
  description?: string;
}

export interface PhotoAlbumMetadata {
  slug: string;
  title: string;
  description: string;
  coverImage: PhotoMetadata;
  photos: PhotoMetadata[];
}

interface PhotoAlbumDefinition {
  slug: string;
  title: string;
  description: string;
  coverIndex?: number;
  photos: PhotoMetadata[];
}

function createPhotoMetadata(
  src: string,
  width: number,
  height: number,
  alt: string,
  description: string,
): PhotoMetadata {
  return {
    src,
    width,
    height,
    alt,
    title: alt,
    description,
  };
}

const photoAlbumDefinitions: PhotoAlbumDefinition[] = [
  {
    slug: "istanbul",
    title: "Istanbul",
    description: "Scenes from springtime in Istanbul across the Bosphorus.",
    coverIndex: 0,
    photos: [
      createPhotoMetadata(
        "https://picsum.photos/seed/istanbul-blue-mosque/2048/1365",
        2048,
        1365,
        "Blue Mosque skyline at sunset in Istanbul",
        "Dusk settles over Sultanahmet and the historic skyline of Istanbul.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/istanbul-grand-bazaar-lanterns/2048/1365",
        2048,
        1365,
        "Lanterns hanging in the Grand Bazaar",
        "Lantern merchants inside the Grand Bazaar glow with warm colors.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/istanbul-galata-bridge-fishermen/2048/1366",
        2048,
        1366,
        "Fishermen on the Galata Bridge",
        "Morning fishermen line the Galata Bridge as ferries cross the Bosphorus.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/istanbul-spice-market-stalls/2048/1280",
        2048,
        1280,
        "Spice Market stalls in Istanbul",
        "Spice Market stalls overflow with colors and textures in Eminonu.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/istanbul-maidens-tower-sunset/2048/1365",
        2048,
        1365,
        "View of the Bosphorus and Maiden's Tower",
        "The Maiden's Tower stands against a hazy Bosphorus sunset.",
      ),
    ],
  },
  {
    slug: "kyoto",
    title: "Kyoto",
    description: "A slow walk through Kyoto's temples, gardens, and lantern-lined alleys.",
    coverIndex: 0,
    photos: [
      createPhotoMetadata(
        "https://picsum.photos/seed/kyoto-fushimi-inari-gates/2048/1366",
        2048,
        1366,
        "Torii gates at Fushimi Inari Shrine",
        "The iconic vermillion torii gates wind up the hill at Fushimi Inari.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/kyoto-gion-evening-houses/2048/1365",
        2048,
        1365,
        "Traditional wooden houses in Gion",
        "Evening light reflects on rain-soaked streets in the Gion district.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/kyoto-kinkakuji-golden-pavilion/2048/1365",
        2048,
        1365,
        "Kinkaku-ji Golden Pavilion",
        "Kinkaku-ji's golden facade shines above a mirror-still pond.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/kyoto-arashiyama-bamboo-grove/2048/1365",
        2048,
        1365,
        "Arashiyama bamboo grove",
        "Morning light filters through the towering stalks of Arashiyama's bamboo grove.",
      ),
      createPhotoMetadata(
        "https://picsum.photos/seed/kyoto-zen-garden-stones/2048/1280",
        2048,
        1280,
        "Zen garden stones and raked gravel",
        "A tranquil karesansui garden highlights Kyoto's minimalist design.",
      ),
    ],
  },
];

const photoAlbums: PhotoAlbumMetadata[] = photoAlbumDefinitions.map((albumDefinition) => {
  const coverImage = albumDefinition.photos[albumDefinition.coverIndex ?? 0];

  return {
    slug: albumDefinition.slug,
    title: albumDefinition.title,
    description: albumDefinition.description,
    coverImage,
    photos: albumDefinition.photos,
  };
});

const albumsBySlug = new Map(photoAlbums.map((album) => [album.slug, album]));

export const albumSlugs = photoAlbums.map((album) => album.slug);

export async function getPhotoAlbumBySlug(
  slug: string,
): Promise<PhotoAlbumMetadata | undefined> {
  return albumsBySlug.get(slug);
}

export async function getAllPhotoAlbums(): Promise<PhotoAlbumMetadata[]> {
  return photoAlbums;
}
