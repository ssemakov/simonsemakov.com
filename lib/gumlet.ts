const GUMLET_API_BASE_URL = "https://api.gumlet.com/v1";
const DEFAULT_DELIVERY_BASE_URL = "https://i.gumlet.io";

export interface GumletAsset {
  name: string;
  path?: string;
  url?: string;
  width?: number;
  height?: number;
}

interface RawGumletAsset {
  name?: string;
  file_name?: string;
  path?: string;
  cdn?: { url?: string };
  default_cdn_url?: string;
  url?: string;
  meta?: { width?: number; height?: number };
  dimensions?: { width?: number; height?: number };
}

interface GumletApiResponse {
  data?: RawGumletAsset[] | { items?: RawGumletAsset[] };
  items?: RawGumletAsset[];
  results?: RawGumletAsset[];
  files?: RawGumletAsset[];
}

function getGumletApiKey(): string {
  const apiKey = process.env.GUMLET_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GUMLET_API_KEY environment variable is not set. Please configure your Gumlet API key.",
    );
  }

  return apiKey;
}

function decodeAssets(response: GumletApiResponse): RawGumletAsset[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && Array.isArray(response.data.items)) {
    return response.data.items;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.files)) {
    return response.files;
  }

  return [];
}

function normalizeAsset(raw: RawGumletAsset): GumletAsset | undefined {
  const path = raw.path;
  const url = raw.cdn?.url ?? raw.default_cdn_url ?? raw.url;
  const name = raw.name ?? raw.file_name ?? (path ? path.split("/").pop() : undefined);
  const width = raw.meta?.width ?? raw.dimensions?.width;
  const height = raw.meta?.height ?? raw.dimensions?.height;

  if (!name) {
    return undefined;
  }

  return {
    name,
    path,
    url,
    width,
    height,
  };
}

export async function listGumletImages(folder: string): Promise<GumletAsset[]> {
  const apiKey = getGumletApiKey();
  const normalizedFolder = folder.replace(/^\/+/, "").replace(/\/$/, "");

  const url = new URL(`${GUMLET_API_BASE_URL}/files`);
  url.searchParams.set("folder", normalizedFolder);
  url.searchParams.set("limit", "200");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load Gumlet assets for folder ${folder}: ${response.status} ${response.statusText}`,
    );
  }

  const payload: GumletApiResponse = await response.json();
  const rawAssets = decodeAssets(payload);

  return rawAssets
    .map(normalizeAsset)
    .filter((asset): asset is GumletAsset => Boolean(asset))
    .map((asset) => ({
      ...asset,
      name: asset.name,
      path: asset.path ?? `${normalizedFolder}/${asset.name}`,
    }));
}

function getDeliveryBaseUrl(): string {
  const explicitBase = process.env.NEXT_PUBLIC_GUMLET_DELIVERY_URL;
  if (explicitBase && explicitBase.trim().length > 0) {
    return explicitBase.replace(/\/$/, "");
  }

  return DEFAULT_DELIVERY_BASE_URL;
}

export function resolveGumletImageUrl(asset: GumletAsset, fallbackFolder?: string): string | undefined {
  if (asset.url) {
    return asset.url;
  }

  const baseUrl = getDeliveryBaseUrl();
  const sanitizedFolder = fallbackFolder?.replace(/^\/+/, "").replace(/\/$/, "");
  const path = asset.path ?? (sanitizedFolder ? `${sanitizedFolder}/${asset.name}` : asset.name);
  if (!path) {
    return undefined;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
}
