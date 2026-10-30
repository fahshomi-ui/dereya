import { io } from "socket.io-client";
import { requestBujairiPresenceToken } from "./store";

type PresenceStarter = (options: {
  apiBase: string;
  path: string;
  createSocket: typeof io;
  verify: typeof requestBujairiPresenceToken;
}) => () => void;

export function isBujairiPresencePath(path: string): boolean {
  const pathname = path.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  return ["/", "/bujairi-terrace", "/at-turaif", "/salwa-palace", "/dining", "/shopping", "/plan-your-visit"].includes(pathname);
}

export function startBujairiPresence(apiBase: string, path: string): () => void {
  const start = (window as Window & { __bujairiStartPresence?: PresenceStarter }).__bujairiStartPresence;
  if (!start) return () => {};
  return start({ apiBase, path, createSocket: io, verify: requestBujairiPresenceToken });
}

export function resolveBujairiIframePath(fallback: string): string {
  const candidate = new URLSearchParams(window.location.search).get("bujairi_page");
  if (!candidate || candidate.length > 4096) return fallback;
  try {
    const url = new URL(candidate, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/bujairi/") || !url.pathname.endsWith("/index.html")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
