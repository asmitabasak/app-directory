'use client';

import { Boundary } from '#/ui/boundary';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

type PrefetchState = 'prefetching' | 'prefetched' | 'failed';

// DEMO: State tracking for runtime prefetch visualization. This Map and Set
// are used to track prefetch loading states and notify components when the
// state changes, enabling the visual feedback (pink pulsing border while
// prefetching, blue border when complete) shown in this demo.
const loadingState = new Map<string, PrefetchState>();
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function updateLoadingState(pathname: string, state: PrefetchState) {
  if (loadingState.get(pathname) === state) {
    return;
  }

  loadingState.set(pathname, state);
  notifySubscribers();
}

function getHeaderValue(
  headers: HeadersInit | undefined,
  key: string,
): string | null {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  if (Array.isArray(headers)) {
    const found = headers.find(([headerKey]) =>
      headerKey.toLowerCase() === key.toLowerCase(),
    );
    return found?.[1] ?? null;
  }

  return (
    headers[key as keyof typeof headers] ??
    headers[key.toLowerCase() as keyof typeof headers] ??
    null
  );
}

function getRequestPathname(requestInfo: RequestInfo | URL): string | null {
  try {
    if (requestInfo instanceof URL) {
      return requestInfo.pathname;
    }

    if (typeof requestInfo === 'string') {
      return new URL(requestInfo, window.location.origin).pathname;
    }

    if (requestInfo instanceof Request) {
      return new URL(requestInfo.url, window.location.origin).pathname;
    }

    return null;
  } catch {
    return null;
  }
}

function isRuntimePrefetchRequest(
  requestInfo: RequestInfo | URL,
  init?: RequestInit,
): boolean {
  const requestHeaders =
    requestInfo instanceof Request ? requestInfo.headers : undefined;
  const headerValue =
    getHeaderValue(init?.headers, 'next-router-prefetch') ??
    getHeaderValue(requestHeaders, 'next-router-prefetch');

  return headerValue === '2';
}

// DEMO: Fetch patching for visualization purposes only. This code intercepts
// Next.js runtime prefetch requests to track their loading states and provide
// visual feedback in the UI. DO NOT use this pattern in production apps - it's
// solely for demonstrating how runtime prefetching works with private cache.
if (typeof window !== 'undefined') {
  const state = globalThis as typeof globalThis & {
    __privateCacheFetchPatched?: boolean;
    __privateCacheOriginalFetch?: typeof fetch;
  };

  if (!state.__privateCacheFetchPatched) {
    state.__privateCacheOriginalFetch ??= globalThis.fetch;
    const originalFetch = state.__privateCacheOriginalFetch;

    globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
      if (!isRuntimePrefetchRequest(args[0], args[1])) {
        return originalFetch(...args);
      }

      const pathname = getRequestPathname(args[0]);
      if (pathname) {
        updateLoadingState(pathname, 'prefetching');
      }

      try {
        const response = await originalFetch(...args);
        if (pathname) {
          updateLoadingState(pathname, response.ok ? 'prefetched' : 'failed');
        }
        return response;
      } catch (error) {
        if (pathname) {
          updateLoadingState(pathname, 'failed');
        }
        throw error;
      }
    };

    state.__privateCacheFetchPatched = true;
  }
}

function getSnapshot(pathname: string): PrefetchState | 'idle' {
  return loadingState.get(pathname) ?? 'idle';
}

export default function ProductLink({
  children,
  href,
  privateCache = false,
}: {
  children: React.ReactNode;
  href: string;
  privateCache: boolean;
}) {
  // Extract pathname from href
  const pathname = href.startsWith('/') ? href : new URL(href).pathname;

  // Subscribe to loading state changes
  const state = useSyncExternalStore(
    subscribe,
    () => getSnapshot(pathname),
    () => 'idle',
  );

  // Determine color and label based on loading state
  let color: 'pink' | 'blue' | undefined;
  let label: string;

  if (!privateCache) {
    label = '<Link> (No Private Cache)';
  } else if (state === 'prefetched') {
    color = 'blue';
    label = '<Link> (Prefetched Private Cache)';
  } else if (state === 'prefetching') {
    color = 'pink';
    label = '<Link> (Prefetching Private Cache...)';
  } else if (state === 'failed') {
    label = '<Link> (Private Cache Prefetch Failed)';
  } else {
    label = '<Link> (Private Cache Ready)';
  }

  return (
    <Link href={href}>
      <Boundary
        label={label}
        size="small"
        color={color}
        animateRerendering={false}
        pulse={state === 'prefetching'}
      >
        {children}
      </Boundary>
    </Link>
  );
}
