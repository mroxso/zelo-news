import { describe, it, expect } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  validateHighlight,
  getHighlightSource,
  getHighlightComment,
  getHighlightContext,
  getHighlightAuthors,
  isQuoteHighlight,
  cleanUrl,
} from './validators';

describe('validateHighlight', () => {
  it('validates a basic highlight with e tag', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 9802,
      tags: [
        ['e', 'event-id'],
        ['p', 'author-pubkey', '', 'author'],
      ],
      content: 'This is a highlighted passage',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(true);
  });

  it('validates a highlight with a tag', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 9802,
      tags: [
        ['a', '30023:author-pubkey:identifier'],
        ['p', 'author-pubkey', '', 'author'],
      ],
      content: 'This is a highlighted passage',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(true);
  });

  it('validates a highlight with r tag', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 9802,
      tags: [
        ['r', 'https://example.com/article'],
      ],
      content: 'This is a highlighted passage',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(true);
  });

  it('rejects events that are not kind 9802', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 1,
      tags: [['e', 'event-id']],
      content: 'This is a note',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(false);
  });

  it('rejects highlights without reference tags', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 9802,
      tags: [
        ['p', 'author-pubkey', '', 'author'],
      ],
      content: 'This is a highlighted passage',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(false);
  });

  it('allows empty content for non-text media', () => {
    const event: NostrEvent = {
      id: 'test-id',
      pubkey: 'test-pubkey',
      created_at: 1234567890,
      kind: 9802,
      tags: [['e', 'event-id']],
      content: '',
      sig: 'test-sig',
    };

    expect(validateHighlight(event)).toBe(true);
  });
});

describe('getHighlightSource', () => {
  it('extracts address source from a tag', () => {
    const event = {
      kind: 9802,
      tags: [['a', '30023:pubkey:identifier']],
    } as never;

    const source = getHighlightSource(event);
    expect(source).toEqual({
      type: 'address',
      value: '30023:pubkey:identifier',
    });
  });

  it('extracts event source from e tag', () => {
    const event = {
      kind: 9802,
      tags: [['e', 'event-id']],
    } as never;

    const source = getHighlightSource(event);
    expect(source).toEqual({
      type: 'event',
      value: 'event-id',
    });
  });

  it('extracts URL source from r tag', () => {
    const event = {
      kind: 9802,
      tags: [['r', 'https://example.com/article']],
    } as never;

    const source = getHighlightSource(event);
    expect(source).toEqual({
      type: 'url',
      value: 'https://example.com/article',
    });
  });

  it('prioritizes a tag over e and r tags', () => {
    const event = {
      kind: 9802,
      tags: [
        ['a', '30023:pubkey:identifier'],
        ['e', 'event-id'],
        ['r', 'https://example.com'],
      ],
    } as never;

    const source = getHighlightSource(event);
    expect(source?.type).toBe('address');
  });

  it('returns null when no reference tags exist', () => {
    const event = {
      kind: 9802,
      tags: [['p', 'author-pubkey']],
    } as never;

    const source = getHighlightSource(event);
    expect(source).toBeNull();
  });
});

describe('getHighlightComment', () => {
  it('extracts comment from quote highlight', () => {
    const event = {
      kind: 9802,
      tags: [
        ['e', 'event-id'],
        ['comment', 'This is my commentary'],
      ],
    } as never;

    expect(getHighlightComment(event)).toBe('This is my commentary');
  });

  it('returns null when no comment exists', () => {
    const event = {
      kind: 9802,
      tags: [['e', 'event-id']],
    } as never;

    expect(getHighlightComment(event)).toBeNull();
  });
});

describe('getHighlightContext', () => {
  it('extracts context text', () => {
    const event = {
      kind: 9802,
      tags: [
        ['e', 'event-id'],
        ['context', 'This is the surrounding paragraph text'],
      ],
    } as never;

    expect(getHighlightContext(event)).toBe('This is the surrounding paragraph text');
  });

  it('returns null when no context exists', () => {
    const event = {
      kind: 9802,
      tags: [['e', 'event-id']],
    } as never;

    expect(getHighlightContext(event)).toBeNull();
  });
});

describe('getHighlightAuthors', () => {
  it('extracts all author pubkeys', () => {
    const event = {
      kind: 9802,
      tags: [
        ['e', 'event-id'],
        ['p', 'author1', '', 'author'],
        ['p', 'author2', '', 'author'],
        ['p', 'mentioned', '', 'mention'],
      ],
    } as never;

    const authors = getHighlightAuthors(event);
    expect(authors).toEqual(['author1', 'author2']);
  });

  it('returns empty array when no authors exist', () => {
    const event = {
      kind: 9802,
      tags: [['e', 'event-id']],
    } as never;

    const authors = getHighlightAuthors(event);
    expect(authors).toEqual([]);
  });

  it('filters out mentions and only includes authors', () => {
    const event = {
      kind: 9802,
      tags: [
        ['p', 'author', '', 'author'],
        ['p', 'mention', '', 'mention'],
        ['p', 'editor', '', 'editor'],
      ],
    } as never;

    const authors = getHighlightAuthors(event);
    expect(authors).toEqual(['author']);
  });
});

describe('isQuoteHighlight', () => {
  it('returns true for highlights with comment tag', () => {
    const event = {
      kind: 9802,
      tags: [
        ['e', 'event-id'],
        ['comment', 'My thoughts'],
      ],
    } as never;

    expect(isQuoteHighlight(event)).toBe(true);
  });

  it('returns false for highlights without comment tag', () => {
    const event = {
      kind: 9802,
      tags: [['e', 'event-id']],
    } as never;

    expect(isQuoteHighlight(event)).toBe(false);
  });
});

describe('cleanUrl', () => {
  it('removes UTM parameters', () => {
    const url = 'https://example.com/article?utm_source=twitter&utm_medium=social&utm_campaign=spring';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('https://example.com/article');
  });

  it('removes tracking parameters', () => {
    const url = 'https://example.com/article?fbclid=abc123&gclid=xyz789';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('https://example.com/article');
  });

  it('preserves non-tracking parameters', () => {
    const url = 'https://example.com/article?page=2&sort=date';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('https://example.com/article?page=2&sort=date');
  });

  it('handles URLs with mixed parameters', () => {
    const url = 'https://example.com/article?page=2&utm_source=twitter&sort=date';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('https://example.com/article?page=2&sort=date');
  });

  it('handles URLs without query parameters', () => {
    const url = 'https://example.com/article';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('https://example.com/article');
  });

  it('returns original URL when parsing fails', () => {
    const url = 'not-a-valid-url';
    const cleaned = cleanUrl(url);
    expect(cleaned).toBe('not-a-valid-url');
  });
});
