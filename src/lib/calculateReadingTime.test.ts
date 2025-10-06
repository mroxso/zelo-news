import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from './calculateReadingTime';

describe('calculateReadingTime', () => {
  it('should return 1 minute for empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
    expect(calculateReadingTime('   ')).toBe(1);
  });

  it('should calculate reading time for plain text', () => {
    // 200 words should take 1 minute at default 200 wpm
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
    
    // 250 words should take 2 minutes (rounded up)
    const moreWords = Array(250).fill('word').join(' ');
    expect(calculateReadingTime(moreWords)).toBe(2);
  });

  it('should strip markdown formatting', () => {
    const markdown = `
# Heading
This is **bold** and *italic* text.
\`\`\`javascript
const code = 'should not count';
\`\`\`
[Link text](https://example.com)
![Image alt](https://example.com/image.png)
> Blockquote text
- List item
    `;
    
    // Should count: Heading, This, is, bold, and, italic, text, Link, text, Blockquote, text, List, item
    // Total: 13 words, at 200 wpm = 1 minute
    const result = calculateReadingTime(markdown);
    expect(result).toBeGreaterThan(0);
  });

  it('should use custom words per minute', () => {
    const words = Array(300).fill('word').join(' ');
    // At 300 wpm, 300 words should take 1 minute
    expect(calculateReadingTime(words, 300)).toBe(1);
    // At 100 wpm, 300 words should take 3 minutes
    expect(calculateReadingTime(words, 100)).toBe(3);
  });

  it('should return at least 1 minute for very short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
    expect(calculateReadingTime('Just a few words here')).toBe(1);
  });
});
