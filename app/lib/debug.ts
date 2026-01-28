export function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('debug') === '1') return true;
  } catch {
    // ignore
  }

  try {
    return window.localStorage.getItem('sv_debug') === '1';
  } catch {
    return false;
  }
}

export function debugLog(scope: string, message: string, data?: unknown) {
  if (!isDebugEnabled()) return;
  const prefix = `[sv:${scope}]`;
  // eslint-disable-next-line no-console
  if (data === undefined) console.info(prefix, message);
  // eslint-disable-next-line no-console
  else console.info(prefix, message, data);
}
