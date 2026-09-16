export const DEFAULT_BASE_PATH = '/';
export const DEFAULT_PORT = 5173;
export const DEFAULT_API_PORT = 5000;

export function resolveBasePath(basePath?: string): string {
  const candidate = (basePath ?? DEFAULT_BASE_PATH).trim();

  if (!candidate) {
    return DEFAULT_BASE_PATH;
  }

  const normalized = candidate.replace(/\/+$/, '');
  return normalized || DEFAULT_BASE_PATH;
}

export function resolveApiBaseUrl(apiBaseUrl?: string | null): string | null {
  if (!apiBaseUrl) {
    return null;
  }

  const candidate = apiBaseUrl.trim();
  if (!candidate) {
    return null;
  }

  return candidate.replace(/\/+$/, '');
}

export function resolvePort(rawPort: string | undefined, fallback: number): number {
  const nextPort = Number(rawPort ?? fallback);

  if (Number.isNaN(nextPort) || nextPort <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort ?? fallback}"`);
  }

  return nextPort;
}
