export function normalizeBasePath(basePath: string): string {
  const normalized = `/${basePath.trim().replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/" : normalized;
}

export function prefixBasePath(path: string, basePath: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const normalizedBase = normalizeBasePath(basePath);
  if (normalizedBase === "/") {
    return path;
  }

  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) {
    return path;
  }

  return path === "/" ? `${normalizedBase}/` : `${normalizedBase}${path}`;
}

export function withBase(path: string): string {
  return prefixBasePath(path, import.meta.env.BASE_URL);
}
