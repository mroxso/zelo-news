import { describe, it, expect } from 'vitest';
import { parseClientTag } from './parseClientTag';
import type { NostrEvent } from '@nostrify/nostrify';

describe('parseClientTag', () => {
  it('should return undefined if no client tag exists', () => {
    const event: NostrEvent = {
      id: '123',
      pubkey: 'abc',
      created_at: 1234567890,
      kind: 1,
      tags: [],
      content: 'test',
      sig: 'sig',
    };

    const result = parseClientTag(event);
    expect(result).toBeUndefined();
  });

  it('should parse a client tag with only name', () => {
    const event: NostrEvent = {
      id: '123',
      pubkey: 'abc',
      created_at: 1234567890,
      kind: 1,
      tags: [['client', 'zelo.news']],
      content: 'test',
      sig: 'sig',
    };

    const result = parseClientTag(event);
    expect(result).toEqual({
      name: 'zelo.news',
      address: undefined,
      relay: undefined,
    });
  });

  it('should parse a full NIP-89 client tag', () => {
    const event: NostrEvent = {
      id: '123',
      pubkey: 'abc',
      created_at: 1234567890,
      kind: 1,
      tags: [
        ['client', 'My Client', '31990:pubkey123:identifier', 'wss://relay.example.com'],
      ],
      content: 'test',
      sig: 'sig',
    };

    const result = parseClientTag(event);
    expect(result).toEqual({
      name: 'My Client',
      address: '31990:pubkey123:identifier',
      relay: 'wss://relay.example.com',
    });
  });

  it('should return undefined for empty client tag', () => {
    const event: NostrEvent = {
      id: '123',
      pubkey: 'abc',
      created_at: 1234567890,
      kind: 1,
      tags: [['client']],
      content: 'test',
      sig: 'sig',
    };

    const result = parseClientTag(event);
    expect(result).toBeUndefined();
  });
});
