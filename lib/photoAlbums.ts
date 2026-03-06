import { listGumletImages, resolveGumletImageUrl } from "./gumlet";

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

interface PhotoDefinition {
  fileName: string;
  alt: string;
  description: string;
  fallbackWidth: number;
  fallbackHeight: number;
}

interface PhotoAlbumDefinition {
  slug: string;
  title: string;
  description: string;
  gumletFolder: string;
  photos: PhotoDefinition[];
  coverPhoto?: string;
}

const istanbulAlbum: PhotoAlbumDefinition = {
  slug: "istanbul",
  title: "Istanbul",
  description: "Scenes from springtime in Istanbul across the Bosphorus.",
  gumletFolder: "albums/istanbul",
  coverPhoto: "istanbul-blue-mosque.jpg",
  photos: [
    {
      fileName: "istanbul-blue-mosque.jpg",
      alt: "Blue Mosque skyline at sunset in Istanbul",
      description: "Dusk settles over Sultanahmet and the historic skyline of Istanbul.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
    {
      fileName: "istanbul-grand-bazaar-lanterns.jpg",
      alt: "Lanterns hanging in the Grand Bazaar",
      description: "Lantern merchants inside the Grand Bazaar glow with warm colors.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
    {
      fileName: "istanbul-galata-bridge-fishermen.jpg",
      alt: "Fishermen on the Galata Bridge",
      description: "Morning fishermen line the Galata Bridge as ferries cross the Bosphorus.",
      fallbackWidth: 2048,
      fallbackHeight: 1366,
    },
    {
      fileName: "istanbul-spice-market-stalls.jpg",
      alt: "Spice Market stalls in Istanbul",
      description: "Spice Market stalls overflow with colors and textures in Eminönü.",
      fallbackWidth: 2048,
      fallbackHeight: 1280,
    },
    {
      fileName: "istanbul-maidens-tower-sunset.jpg",
      alt: "View of the Bosphorus and Maiden's Tower",
      description: "The Maiden's Tower stands against a hazy Bosphorus sunset.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
  ],
};

const kyotoAlbum: PhotoAlbumDefinition = {
  slug: "kyoto",
  title: "Kyoto",
  description: "A slow walk through Kyoto's temples, gardens, and lantern-lined alleys.",
  gumletFolder: "albums/kyoto",
  coverPhoto: "kyoto-fushimi-inari-gates.jpg",
  photos: [
    {
      fileName: "kyoto-fushimi-inari-gates.jpg",
      alt: "Torii gates at Fushimi Inari Shrine",
      description: "The iconic vermillion torii gates wind up the hill at Fushimi Inari.",
      fallbackWidth: 2048,
      fallbackHeight: 1366,
    },
    {
      fileName: "kyoto-gion-evening-houses.jpg",
      alt: "Traditional wooden houses in Gion",
      description: "Evening light reflects on rain-soaked streets in the Gion district.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
    {
      fileName: "kyoto-kinkakuji-golden-pavilion.jpg",
      alt: "Kinkaku-ji Golden Pavilion",
      description: "Kinkaku-ji's golden facade shines above a mirror-still pond.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
    {
      fileName: "kyoto-arashiyama-bamboo-grove.jpg",
      alt: "Arashiyama bamboo grove",
      description: "Morning light filters through the towering stalks of Arashiyama's bamboo grove.",
      fallbackWidth: 2048,
      fallbackHeight: 1365,
    },
    {
      fileName: "kyoto-zen-garden-stones.jpg",
      alt: "Zen garden stones and raked gravel",
      description: "A tranquil karesansui garden highlights Kyoto's minimalist design.",
      fallbackWidth: 2048,
      fallbackHeight: 1280,
    },
  ],
};

const photoAlbumDefinitions: PhotoAlbumDefinition[] = [istanbulAlbum, kyotoAlbum];

interface GumletAssetSummary {
  name: string;
  path?: string;
  width?: number;
  height?: number;
  url?: string;
}

const albumMetadataCache = new Map<string, Promise<PhotoAlbumMetadata>>();

async function buildPhotoMetadata(
  album: PhotoAlbumDefinition,
): Promise<PhotoAlbumMetadata> {
  const cached = albumMetadataCache.get(album.slug);
  if (cached) {
    return cached;
  }

  const builder = (async () => {
    const assets = await listGumletImages(album.gumletFolder);
    const assetMap = new Map<string, GumletAssetSummary>();

    for (const asset of assets) {
      const name = asset.name.toLowerCase();
      assetMap.set(name, asset);
      const pathKey = asset.path ? asset.path.toLowerCase() : undefined;
      if (pathKey) {
        assetMap.set(pathKey, asset);
        const withoutFolder = pathKey.replace(`${album.gumletFolder.toLowerCase()}/`, "");
        assetMap.set(withoutFolder, asset);
      }
    }

    const photoTuples = album.photos
      .map((photo) => {
        const key = photo.fileName.toLowerCase();
        const asset = assetMap.get(key);

        if (!asset) {
          throw new Error(
            `Gumlet asset for ${photo.fileName} not found in folder ${album.gumletFolder}`,
          );
        }

        const width = asset.width ?? photo.fallbackWidth;
        const height = asset.height ?? photo.fallbackHeight;
        const src = resolveGumletImageUrl(asset, album.gumletFolder);

        if (!width || !height || !src) {
          throw new Error(
            `Incomplete metadata for Gumlet asset ${photo.fileName} in folder ${album.gumletFolder}`,
          );
        }

        return {
          fileName: key,
          metadata: {
            src,
            width,
            height,
            alt: photo.alt,
            title: photo.alt,
            description: photo.description,
          },
        };
      });

    const photos = photoTuples.map((tuple) => tuple.metadata);

    if (!photos.length) {
      throw new Error(
        `Unable to build photo metadata for album ${album.slug}. No Gumlet assets matched the configured photos.`,
      );
    }

    const coverSource = album.coverPhoto?.toLowerCase();
    const coverImage = coverSource
      ? photoTuples.find((tuple) => tuple.fileName === coverSource)?.metadata ?? photos[0]
      : photos[0];

    return {
      slug: album.slug,
      title: album.title,
      description: album.description,
      coverImage,
      photos,
    };
  })();

  albumMetadataCache.set(album.slug, builder);
  return builder;
}

export const albumSlugs = photoAlbumDefinitions.map((album) => album.slug);

export async function getPhotoAlbumBySlug(
  slug: string,
): Promise<PhotoAlbumMetadata | undefined> {
  const album = photoAlbumDefinitions.find((entry) => entry.slug === slug);
  if (!album) {
    return undefined;
  }

  return buildPhotoMetadata(album);
}

export async function getAllPhotoAlbums(): Promise<PhotoAlbumMetadata[]> {
  const albums = await Promise.all(
    photoAlbumDefinitions.map(async (definition) => buildPhotoMetadata(definition)),
  );

  return albums;
}
