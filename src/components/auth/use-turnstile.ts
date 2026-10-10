"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_WAIT_MS = 15_000;
let scriptPromise: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile unavailable")));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Invisible Cloudflare Turnstile. The widget runs in the background (no checkbox); with a "Managed"
 * widget it only shows a challenge when Cloudflare needs one. Tokens are single-use, so call
 * `reset()` after every submit. Returns a no-op when `siteKey` is null (captcha disabled).
 */
export function useTurnstile(siteKey: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<Array<(value: string | null) => void>>([]);
  const [failed, setFailed] = useState(false);

  const settle = (value: string | null) => {
    token.current = value;
    waiters.current.splice(0).forEach(resolve => resolve(value));
  };

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadTurnstile()
      .then(turnstile => {
        if (cancelled || !containerRef.current) return;
        widgetId.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (value: string) => settle(value),
          "expired-callback": () => (token.current = null),
          "error-callback": () => {
            setFailed(true);
            settle(null);
          },
        });
      })
      .catch(() => {
        setFailed(true);
        settle(null);
      });
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  /** Resolves with a fresh token, or null when captcha is disabled or verification failed. */
  const getToken = useCallback((): Promise<string | null> => {
    if (!siteKey) return Promise.resolve(null);
    if (token.current) return Promise.resolve(token.current);
    return new Promise(resolve => {
      waiters.current.push(resolve);
      setTimeout(() => resolve(token.current), TOKEN_WAIT_MS);
    });
  }, [siteKey]);

  const reset = useCallback(() => {
    token.current = null;
    setFailed(false);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  return { containerRef, getToken, reset, failed, enabled: Boolean(siteKey) };
}
