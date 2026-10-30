import { io } from "socket.io-client";
import { requestBujairiPresenceToken } from "./store";

// Coalesce the complete verification request, not just the single-use widget token.
// A disposed previous root cannot cause another POST when a new root resumes.
let pendingVerification: { apiBase: string; promise: ReturnType<typeof requestBujairiPresenceToken> } | null = null;
function verifyBujairiOnce(apiBase: string): ReturnType<typeof requestBujairiPresenceToken> {
  if (pendingVerification && pendingVerification.apiBase === apiBase) return pendingVerification.promise;
  const promise = requestBujairiPresenceToken(apiBase);
  pendingVerification = { apiBase, promise };
  const clear = () => { if (pendingVerification?.promise === promise) pendingVerification = null; };
  void promise.then(clear, clear);
  return promise;
}

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
  let disposed = false;
  let stop: (() => void) | null = null;
  const boot = () => {
    if (disposed || stop) return;
    const start = (window as Window & { __bujairiStartPresence?: PresenceStarter }).__bujairiStartPresence;
    if (!start) return;
    window.removeEventListener("bujairi-presence-ready", boot);
    document.removeEventListener("DOMContentLoaded", boot);
    stop = start({ apiBase, path, createSocket: io, verify: verifyBujairiOnce });
  };
  // A cached application bundle can mount before the new deferred presence file.
  window.addEventListener("bujairi-presence-ready", boot);
  document.addEventListener("DOMContentLoaded", boot);
  boot();
  return () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("bujairi-presence-ready", boot);
    document.removeEventListener("DOMContentLoaded", boot);
    if (stop) stop();
  };
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
