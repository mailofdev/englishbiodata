import staticContent from './static.json';

export const content = staticContent;

export function getContent(path, fallback) {
  if (!path) return fallback;
  const parts = String(path).split('.').filter(Boolean);
  let cur = staticContent;
  for (const p of parts) {
    if (cur == null) return fallback;
    cur = cur[p];
  }
  return cur == null ? fallback : cur;
}

