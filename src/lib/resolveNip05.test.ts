import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveNip05 } from './resolveNip05';

describe('resolveNip05', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves a valid NIP-05 identifier', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          bob: 'b0635d6a9851d3aed0cd6c495b282167acf761729078d975fc341b22650b07b9',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBe('b0635d6a9851d3aed0cd6c495b282167acf761729078d975fc341b22650b07b9');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/.well-known/nostr.json?name=bob',
      expect.objectContaining({
        redirect: 'error',
      })
    );
  });

  it('returns null for invalid identifier format', async () => {
    const result = await resolveNip05('invalid');
    expect(result).toBeNull();
  });

  it('returns null when fetch fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('returns null when names object is missing', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('returns null when pubkey is not found in names', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          alice: 'abc123',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('returns null when pubkey is invalid hex', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          bob: 'not-valid-hex',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('returns null when pubkey is wrong length', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          bob: 'abc123', // Too short
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('handles network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBeNull();
  });

  it('normalizes pubkey to lowercase', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        names: {
          bob: 'B0635D6A9851D3AED0CD6C495B282167ACF761729078D975FC341B22650B07B9',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await resolveNip05('bob@example.com');
    expect(result).toBe('b0635d6a9851d3aed0cd6c495b282167acf761729078d975fc341b22650b07b9');
  });
});
