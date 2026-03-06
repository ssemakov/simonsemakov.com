import { resolveGumletPath } from "./gumlet";
import {
  photoAlbumsManifest,
  type PhotoAlbumManifestEntry,
  type PhotoManifestEntry,
} from "./photoAlbumsManifest";

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

let cachedPhotoAlbums: PhotoAlbumMetadata[] | undefined;

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolvePhotoSource(photo: PhotoManifestEntry): string {
  if (photo.src && photo.src.trim().length > 0) {
    return photo.src;
  }

  if (photo.path && photo.path.trim().length > 0) {
    return resolveGumletPath(photo.path);
  }

  throw new Error("Photo manifest entry must include either `src` or `path`.");
}

function buildPhotoMetadata(photo: PhotoManifestEntry): PhotoMetadata {
  if (photo.width <= 0 || photo.height <= 0) {
    throw new Error(`Invalid photo dimensions: ${photo.width}x${photo.height}`);
  }

  const src = resolvePhotoSource(photo);

  return {
    src,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    title: photo.title ?? photo.alt,
    description: photo.description,
  };
}

function buildAlbumMetadata(album: PhotoAlbumManifestEntry): PhotoAlbumMetadata {
  const slug = normalizeSlug(album.slug);
  if (!slug) {
    throw new Error(`Album slug is invalid: "${album.slug}"`);
  }

  if (!album.photos.length) {
    throw new Error(`Album "${slug}" has no photos.`);
  }

  const photos = album.photos.map(buildPhotoMetadata);
  const coverPhotoIndex = album.coverPhotoIndex ?? 0;
  const coverImage = photos[coverPhotoIndex] ?? photos[0];

  return {
    slug,
    title: album.title,
    description: album.description,
    coverImage,
    photos,
  };
}

function loadAlbumsFromManifest(): PhotoAlbumMetadata[] {
  if (!cachedPhotoAlbums) {
    const albums = photoAlbumsManifest.map(buildAlbumMetadata);
    const slugSet = new Set<string>();

    for (const album of albums) {
      if (slugSet.has(album.slug)) {
        throw new Error(`Duplicate album slug in manifest: "${album.slug}"`);
      }

      slugSet.add(album.slug);
    }

    cachedPhotoAlbums = albums;
  }

  return cachedPhotoAlbums;
}

export async function getPhotoAlbumSlugs(): Promise<string[]> {
  return loadAlbumsFromManifest().map((album) => album.slug);
}

export async function getPhotoAlbumBySlug(
  slug: string,
): Promise<PhotoAlbumMetadata | undefined> {
  return loadAlbumsFromManifest().find((album) => album.slug === slug);
}

export async function getAllPhotoAlbums(): Promise<PhotoAlbumMetadata[]> {
  return loadAlbumsFromManifest();
}
