import { useNostr } from "@nostrify/react";
import { useQuery } from "@tanstack/react-query";
import type { NostrEvent } from "@nostrify/nostrify";

/**
 * Normalize a relay URL by ensuring it has a wss:// protocol and no trailing slash.
 */
function normalizeRelayUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  // Add protocol if missing
  const withProto = trimmed.includes("://") ? trimmed : `wss://${trimmed}`;

  try {
    const u = new URL(withProto);
    // Lowercase protocol + host, preserve pathname only if not '/'
    const pathname = u.pathname === "/" ? "" : u.pathname;
    const search = u.search || "";
    const hash = u.hash || "";
    return `${u.protocol}//${u.host}${pathname}${search}${hash}`;
  } catch {
    // If URL constructor fails, fallback to original withProto
    return withProto;
  }
}

/**
 * Extract relay URLs from a NIP-65 (kind 10002) event.
 */
function extractRelaysFromEvent(event?: NostrEvent): string[] {
  if (!event) return [];
  const urls = event.tags
    .filter((t) => t[0] === "r" && typeof t[1] === "string" && t[1])
    .map((t) => normalizeRelayUrl(t[1]!));

  // Dedupe
  return Array.from(new Set(urls));
}

/**
 * Fetches the latest NIP-65 Relay List (kind 10002) for a user and returns an array of normalized relay URLs.
 *
 * Returns a React Query result containing the array of relay URLs.
 * The query is disabled when `pubkey` is undefined.
 *
 * @param {string} [pubkey] - The public key of the user whose relay list to fetch.
 * @returns {import("@tanstack/react-query").UseQueryResult<string[], unknown>} React Query result with an array of normalized relay URLs.
 */
export function useUserRelays(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    enabled: !!pubkey,
    queryKey: ["user-relays", pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      const events = await nostr.query(
        [
          {
            kinds: [10002], // NIP-65 Relay List Metadata
            authors: [pubkey!],
            limit: 3, // fetch a few and pick the newest, some relays ignore limit ordering
          },
        ],
        { signal }
      );

      // Pick the newest by created_at
      const latest = events
        .filter((e): e is NostrEvent => !!e)
        .sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))[0];

      return extractRelaysFromEvent(latest);
    },
  });
}
