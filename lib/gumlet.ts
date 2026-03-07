const DEFAULT_DELIVERY_BASE_URL = "https://i.gumlet.io";

export function getGumletDeliveryBaseUrl(): string {
  const explicitBase = process.env.NEXT_PUBLIC_GUMLET_DELIVERY_URL;
  if (explicitBase && explicitBase.trim().length > 0) {
    return explicitBase.replace(/\/$/, "");
  }

  return DEFAULT_DELIVERY_BASE_URL;
}

export function resolveGumletPath(path: string): string {
  const baseUrl = getGumletDeliveryBaseUrl();
  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
}
