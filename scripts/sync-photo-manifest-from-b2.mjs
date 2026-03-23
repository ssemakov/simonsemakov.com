#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { loadLocalEnvFiles } from "./load-env.mjs";

const B2_AUTHORIZE_URL = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
const DEFAULT_ALBUMS_ROOT = "albums";
const DEFAULT_DIMENSIONS = { width: 2048, height: 1365 };
const IMAGE_FILE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|tiff?|webp)$/i;

function parseArguments(argv) {
  const options = {
    albums: [],
    root: DEFAULT_ALBUMS_ROOT,
    manifest: path.resolve(process.cwd(), "lib/photoAlbumsManifest.ts"),
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (token.startsWith("--albums=")) {
      options.albums = token
        .slice("--albums=".length)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      continue;
    }

    if (token === "--albums") {
      const value = argv[index + 1] ?? "";
      options.albums = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (token.startsWith("--root=")) {
      options.root = token.slice("--root=".length).trim() || DEFAULT_ALBUMS_ROOT;
      continue;
    }

    if (token === "--root") {
      options.root = (argv[index + 1] ?? "").trim() || DEFAULT_ALBUMS_ROOT;
      index += 1;
      continue;
    }

    if (token.startsWith("--manifest=")) {
      const value = token.slice("--manifest=".length).trim();
      options.manifest = path.resolve(process.cwd(), value);
      continue;
    }

    if (token === "--manifest") {
      const value = (argv[index + 1] ?? "").trim();
      if (value) {
        options.manifest = path.resolve(process.cwd(), value);
      }
      index += 1;
      continue;
    }
  }

  return options;
}

function getRequiredEnvVar(name) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${name} is required.`);
  }

  return value.trim();
}

async function callB2Api(apiUrl, authorizationToken, endpoint, payload) {
  const response = await fetch(`${apiUrl}/b2api/v2/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`B2 ${endpoint} failed: ${response.status} ${response.statusText} ${errorBody}`);
  }

  return response.json();
}

async function authorizeB2(keyId, appKey) {
  const authValue = Buffer.from(`${keyId}:${appKey}`).toString("base64");
  const response = await fetch(B2_AUTHORIZE_URL, {
    headers: {
      Authorization: `Basic ${authValue}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`B2 authorization failed: ${response.status} ${response.statusText} ${errorBody}`);
  }

  return response.json();
}

async function getBucketName(apiUrl, authorizationToken, accountId, bucketId) {
  const payload = await callB2Api(apiUrl, authorizationToken, "b2_list_buckets", {
    accountId,
    bucketId,
  });

  const bucket = Array.isArray(payload.buckets)
    ? payload.buckets.find((entry) => entry.bucketId === bucketId)
    : undefined;

  if (!bucket?.bucketName) {
    throw new Error(`Unable to resolve bucket name for bucketId "${bucketId}".`);
  }

  return bucket.bucketName;
}

function normalizeRoot(root) {
  return root.replace(/^\/+/, "").replace(/\/$/, "");
}

function buildCandidatePrefixes(root, albumName) {
  const normalizedAlbum = albumName.replace(/^\/+/, "").replace(/\/$/, "");
  if (!normalizedAlbum) {
    return [];
  }

  const candidates = [];
  const addCandidate = (candidate) => {
    const normalizedCandidate = candidate.replace(/^\/+/, "").replace(/\/$/, "");
    if (!normalizedCandidate) {
      return;
    }

    const withTrailingSlash = `${normalizedCandidate}/`;
    if (!candidates.includes(withTrailingSlash)) {
      candidates.push(withTrailingSlash);
    }
  };

  if (normalizedAlbum.includes("/")) {
    addCandidate(normalizedAlbum);

    if (root && normalizedAlbum.startsWith(`${root}/`)) {
      addCandidate(normalizedAlbum.slice(root.length + 1));
    }
  } else {
    if (root) {
      addCandidate(`${root}/${normalizedAlbum}`);
    }
    addCandidate(normalizedAlbum);
  }

  return candidates;
}

function getAlbumSlugFromPrefix(prefix) {
  const trimmed = prefix.replace(/\/$/, "");
  const segments = trimmed.split("/").filter(Boolean);
  const leaf = segments[segments.length - 1] ?? trimmed;

  return leaf
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function listImageFilesInPrefix(apiUrl, authorizationToken, bucketId, prefix) {
  const files = [];
  let nextFileName = undefined;

  do {
    const payload = await callB2Api(apiUrl, authorizationToken, "b2_list_file_names", {
      bucketId,
      prefix,
      maxFileCount: 1000,
      ...(nextFileName ? { startFileName: nextFileName } : {}),
    });

    const pageFiles = Array.isArray(payload.files) ? payload.files : [];
    files.push(
      ...pageFiles
        .filter((entry) => entry.action === "upload")
        .map((entry) => entry.fileName)
        .filter((fileName) => typeof fileName === "string" && IMAGE_FILE_EXTENSION.test(fileName)),
    );

    nextFileName = payload.nextFileName ?? undefined;
  } while (nextFileName);

  return files.sort((left, right) => left.localeCompare(right));
}

function parsePngSize(buffer) {
  if (buffer.length < 24) {
    return undefined;
  }

  const signature = buffer.subarray(0, 8);
  if (!signature.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseGifSize(buffer) {
  if (buffer.length < 10) {
    return undefined;
  }

  const header = buffer.subarray(0, 6).toString("ascii");
  if (header !== "GIF87a" && header !== "GIF89a") {
    return undefined;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function parseJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;

  while (offset + 3 < buffer.length) {
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset += 1;
    }

    if (offset >= buffer.length) {
      return undefined;
    }

    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) {
      return undefined;
    }

    if (marker >= 0xd0 && marker <= 0xd7) {
      continue;
    }

    if (offset + 1 >= buffer.length) {
      return undefined;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    offset += 2;

    if (segmentLength < 2 || offset + segmentLength - 2 > buffer.length) {
      return undefined;
    }

    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf
    ) {
      return {
        height: buffer.readUInt16BE(offset + 1),
        width: buffer.readUInt16BE(offset + 3),
      };
    }

    offset += segmentLength - 2;
  }

  return undefined;
}

function parseWebpSize(buffer) {
  if (buffer.length < 30) {
    return undefined;
  }

  if (buffer.subarray(0, 4).toString("ascii") !== "RIFF") {
    return undefined;
  }

  if (buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
    return undefined;
  }

  const chunkType = buffer.subarray(12, 16).toString("ascii");

  if (chunkType === "VP8X" && buffer.length >= 30) {
    const width = 1 + buffer[24] + (buffer[25] << 8) + (buffer[26] << 16);
    const height = 1 + buffer[27] + (buffer[28] << 8) + (buffer[29] << 16);
    return { width, height };
  }

  if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits =
      buffer[21] +
      (buffer[22] << 8) +
      (buffer[23] << 16) +
      (buffer[24] << 24);

    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  return undefined;
}

function parseImageSize(buffer) {
  return parsePngSize(buffer) ?? parseGifSize(buffer) ?? parseJpegSize(buffer) ?? parseWebpSize(buffer);
}

function encodeB2FilePath(fileName) {
  return fileName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function resolveImageDimensions(downloadUrl, authorizationToken, bucketName, fileName) {
  const encodedPath = encodeB2FilePath(fileName);
  const fileUrl = `${downloadUrl}/file/${encodeURIComponent(bucketName)}/${encodedPath}`;

  const partialResponse = await fetch(fileUrl, {
    headers: {
      Authorization: authorizationToken,
      Range: "bytes=0-65535",
    },
  });

  if (!partialResponse.ok) {
    throw new Error(
      `Failed to download "${fileName}" from B2: ${partialResponse.status} ${partialResponse.statusText}`,
    );
  }

  const partialBuffer = Buffer.from(await partialResponse.arrayBuffer());
  const partialSize = parseImageSize(partialBuffer);
  if (partialSize?.width && partialSize?.height) {
    return partialSize;
  }

  const fullResponse = await fetch(fileUrl, {
    headers: {
      Authorization: authorizationToken,
    },
  });

  if (!fullResponse.ok) {
    return DEFAULT_DIMENSIONS;
  }

  const fullBuffer = Buffer.from(await fullResponse.arrayBuffer());
  return parseImageSize(fullBuffer) ?? DEFAULT_DIMENSIONS;
}

function slugToTitle(slug) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function readExistingDimensions(manifestContent) {
  const dimensionsByPath = new Map();
  const pattern = /path:\s*"([^"]+)"[\s\S]*?width:\s*(\d+)[\s\S]*?height:\s*(\d+)/g;

  for (const match of manifestContent.matchAll(pattern)) {
    const [, photoPath, width, height] = match;
    dimensionsByPath.set(photoPath, {
      width: Number(width),
      height: Number(height),
    });
  }

  return dimensionsByPath;
}

function escapeString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serializeManifest(albums) {
  const lines = [];

  lines.push("export interface PhotoManifestEntry {");
  lines.push("  src?: string;");
  lines.push("  path?: string;");
  lines.push("  width: number;");
  lines.push("  height: number;");
  lines.push("  alt?: string;");
  lines.push("  title?: string;");
  lines.push("  description?: string;");
  lines.push("}");
  lines.push("");
  lines.push("export interface PhotoAlbumManifestEntry {");
  lines.push("  slug: string;");
  lines.push("  title: string;");
  lines.push("  description: string;");
  lines.push("  coverPhotoIndex?: number;");
  lines.push("  photos: PhotoManifestEntry[];");
  lines.push("}");
  lines.push("");
  lines.push("// Generated by scripts/sync-photo-manifest-from-b2.mjs");
  lines.push("// To regenerate: yarn sync:photos --albums=album-one,album-two");
  lines.push("export const photoAlbumsManifest: PhotoAlbumManifestEntry[] = [");

  for (const album of albums) {
    lines.push("  {");
    lines.push(`    slug: "${escapeString(album.slug)}",`);
    lines.push(`    title: "${escapeString(album.title)}",`);
    lines.push(`    description: "${escapeString(album.description)}",`);
    lines.push("    coverPhotoIndex: 0,");
    lines.push("    photos: [");

    for (const photo of album.photos) {
      lines.push("      {");
      lines.push(`        path: "${escapeString(photo.path)}",`);
      lines.push(`        width: ${photo.width},`);
      lines.push(`        height: ${photo.height},`);
      if (typeof photo.alt === "string" && photo.alt.trim().length > 0) {
        lines.push(`        alt: "${escapeString(photo.alt)}",`);
      }
      lines.push("      },");
    }

    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  await loadLocalEnvFiles();

  const options = parseArguments(process.argv.slice(2));
  if (!options.albums.length) {
    throw new Error("Pass album list with --albums=istanbul,kyoto");
  }

  const keyId = getRequiredEnvVar("B2_KEY_ID");
  const appKey = getRequiredEnvVar("B2_APPLICATION_KEY");
  const bucketId = getRequiredEnvVar("B2_BUCKET_ID");

  const auth = await authorizeB2(keyId, appKey);
  const apiUrl = auth.apiUrl;
  const authorizationToken = auth.authorizationToken;
  const accountId = auth.accountId;
  const downloadUrl = auth.downloadUrl;

  if (!apiUrl || !authorizationToken || !accountId || !downloadUrl) {
    throw new Error("Backblaze authorization response is missing required fields.");
  }

  const bucketName = await getBucketName(apiUrl, authorizationToken, accountId, bucketId);
  const root = normalizeRoot(options.root);

  const existingManifestContent = await fs.readFile(options.manifest, "utf8").catch(() => "");
  const existingDimensionsByPath = readExistingDimensions(existingManifestContent);

  const albums = [];
  for (const albumName of options.albums) {
    const candidatePrefixes = buildCandidatePrefixes(root, albumName);
    if (!candidatePrefixes.length) {
      throw new Error(`Album name "${albumName}" is invalid.`);
    }

    let resolvedPrefix = undefined;
    let files = [];

    for (const candidatePrefix of candidatePrefixes) {
      const candidateFiles = await listImageFilesInPrefix(
        apiUrl,
        authorizationToken,
        bucketId,
        candidatePrefix,
      );
      if (candidateFiles.length > 0) {
        resolvedPrefix = candidatePrefix;
        files = candidateFiles;
        break;
      }
    }

    if (!resolvedPrefix) {
      throw new Error(
        `No images found for album "${albumName}". Tried prefixes: ${candidatePrefixes.join(", ")}`,
      );
    }

    const photos = [];
    for (const fileName of files) {
      const cachedDimensions = existingDimensionsByPath.get(fileName);
      const dimensions =
        cachedDimensions ??
        (await resolveImageDimensions(downloadUrl, authorizationToken, bucketName, fileName));

      photos.push({
        path: fileName,
        width: dimensions.width,
        height: dimensions.height,
      });
    }

    const slug = getAlbumSlugFromPrefix(resolvedPrefix);
    if (!slug) {
      throw new Error(`Unable to generate slug for album "${albumName}".`);
    }

    const title = slugToTitle(slug);

    albums.push({
      slug,
      title,
      description: `Photo album: ${title}`,
      photos,
    });
  }

  const manifestContent = serializeManifest(albums);

  if (options.dryRun) {
    process.stdout.write(manifestContent);
    return;
  }

  await fs.writeFile(options.manifest, manifestContent, "utf8");
  process.stdout.write(`Updated ${options.manifest} with ${albums.length} album(s).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
