/**
 * Resolves public assets relative to the configured Vite BASE_URL.
 * This guarantees that assets load reliably whether the app is hosted
 * at root domain (/), a custom subdomain, or a subpath (/figuraymaker/).
 */
export function getAssetUrl(path: string): string {
  if (!path || path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Strip leading slash so we can cleanly prepend base
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
