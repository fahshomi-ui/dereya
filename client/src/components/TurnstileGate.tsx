import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile: {
      ready?: (callback: () => void) => void;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    // Global function to get a fresh Turnstile token
    getTurnstileToken: () => Promise<string>;
  }
}

const TURNSTILE_SITE_KEY = "0x4AAAAAAFtMChna1_UveUZ3";
const VERIFIED_KEY = "turnstile_verified";
const TURNSTILE_TOKEN_KEY = "turnstile_token";
const TURNSTILE_TOKEN_TIME_KEY = "turnstile_token_time";
// Turnstile tokens expire after 300 seconds (5 minutes) on Cloudflare side
// We use 4 minutes to be safe
const VERIFIED_EXPIRY = 4 * 60 * 1000; // 4 minutes
const TOKEN_MAX_AGE = 4 * 60 * 1000; // 4 minutes - tokens older than this need refresh

// Safe localStorage wrapper for Safari Private Mode
// Safari Private Mode throws QuotaExceededError on setItem
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Safari Private Mode - silently ignore
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Safari Private Mode - silently ignore
  }
}

function isAlreadyVerified(): boolean {
  try {
    const stored = safeGetItem(VERIFIED_KEY);
    if (!stored) return false;
    const { timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp < VERIFIED_EXPIRY && safeGetItem(TURNSTILE_TOKEN_KEY) && isTokenFresh()) {
      return true;
    }
    safeRemoveItem(VERIFIED_KEY);
    safeRemoveItem(TURNSTILE_TOKEN_KEY);
    safeRemoveItem(TURNSTILE_TOKEN_TIME_KEY);
    return false;
  } catch {
    return false;
  }
}

function isTokenFresh(): boolean {
  try {
    const tokenTime = safeGetItem(TURNSTILE_TOKEN_TIME_KEY);
    if (!tokenTime) return false;
    return Date.now() - parseInt(tokenTime) < TOKEN_MAX_AGE;
  } catch {
    return false;
  }
}

// In-memory token storage as fallback when localStorage is unavailable
let memoryToken = "";
let memoryTokenTime = 0;

function setVerified(token?: string): void {
  safeSetItem(
    VERIFIED_KEY,
    JSON.stringify({ timestamp: Date.now() })
  );
  if (token) {
    memoryToken = token;
    memoryTokenTime = Date.now();
    safeSetItem(TURNSTILE_TOKEN_KEY, token);
    safeSetItem(TURNSTILE_TOKEN_TIME_KEY, Date.now().toString());
    // Dispatch custom event so store.ts knows token is ready immediately
    window.dispatchEvent(new CustomEvent("turnstile-token-ready", { detail: token }));
  }
}

interface TurnstileGateProps {
  children: React.ReactNode;
}

export default function TurnstileGate({ children }: TurnstileGateProps) {
  const [verified, setVerifiedState] = useState(() => isAlreadyVerified());
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  const pendingRef = useRef<{
    promise: Promise<string>;
    resolve: (token: string) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const settlePending = useCallback((token: string) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    clearTimeout(pending.timer);
    pending.resolve(token);
  }, []);

  const handleSuccess = useCallback((token: string) => {
    if (!token) return;
    setVerified(token);
    setVerifiedState(true);
    settlePending(token);
  }, [settlePending]);

  const handleError = useCallback(() => {
    memoryToken = "";
    memoryTokenTime = 0;
    safeRemoveItem(VERIFIED_KEY);
    safeRemoveItem(TURNSTILE_TOKEN_KEY);
    safeRemoveItem(TURNSTILE_TOKEN_TIME_KEY);
    setVerifiedState(false);
    settlePending("");
  }, [settlePending]);

  // One persistent widget: allow a real visitor to complete a Managed challenge.
  useEffect(() => {
    window.getTurnstileToken = (): Promise<string> => {
      if (memoryToken && Date.now() - memoryTokenTime < TOKEN_MAX_AGE) {
        return Promise.resolve(memoryToken);
      }
      const storedToken = safeGetItem(TURNSTILE_TOKEN_KEY);
      if (storedToken && isTokenFresh()) return Promise.resolve(storedToken);
      if (pendingRef.current) return pendingRef.current.promise;

      let resolve!: (token: string) => void;
      const promise = new Promise<string>(done => { resolve = done; });
      const timer = setTimeout(() => settlePending(""), 120000);
      pendingRef.current = { promise, resolve, timer };
      setVerifiedState(false);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.reset(widgetIdRef.current); }
        catch { handleError(); }
      }
      return promise;
    };
    return () => {
      delete (window as any).getTurnstileToken;
      settlePending("");
    };
  }, [handleError, settlePending]);

  useEffect(() => {
    if (verified || renderedRef.current) return;
    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !window.turnstile || !containerRef.current || renderedRef.current) return;
      const render = () => {
        if (cancelled || !containerRef.current || renderedRef.current) return;
        renderedRef.current = true;
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: handleSuccess,
            "error-callback": handleError,
            "expired-callback": handleError,
            theme: "light",
            size: "flexible",
            appearance: "interaction-only",
          });
        } catch {
          renderedRef.current = false;
          handleError();
        }
      };
      if (typeof window.turnstile.ready === "function") window.turnstile.ready(render);
      else render();
    };
    renderWidget();
    const interval = setInterval(() => {
      renderWidget();
      if (renderedRef.current) clearInterval(interval);
    }, 100);
    return () => { cancelled = true; clearInterval(interval); };
  }, [verified, handleSuccess, handleError]);

  // Cleanup widget on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, []);

  // The page remains usable; only a genuine token authorizes backend registration.
  return (
    <>
      {children}
      <div
        ref={containerRef}
        aria-hidden={verified ? true : undefined}
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          width: 330,
          maxWidth: "calc(100vw - 24px)",
          minHeight: 65,
          overflow: "visible",
          opacity: verified ? 0 : 1,
          pointerEvents: verified ? "none" : "auto",
          zIndex: 2147483645,
        }}
      />
    </>
  );
}
