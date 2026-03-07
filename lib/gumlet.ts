const DEFAULT_DELIVERY_BASE_URL = "https://i.gumlet.io";

type GumletModifierValue = string | number | boolean | null | undefined;

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

export function withGumletModifiers(
  src: string,
  modifiers: Record<string, GumletModifierValue>,
): string {
  try {
    const url = new URL(src);

    for (const [key, value] of Object.entries(modifiers)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    return url.toString();
  } catch {
    return src;
  }
}
