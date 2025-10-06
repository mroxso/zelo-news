# Nostr Highlights (NIP-84)

This document describes how to implement and use Nostr highlights (kind:9802) in the application. Highlights allow users to curate and share valuable content passages, creating a layer of discovery across the Nostr ecosystem.

## Overview

NIP-84 defines highlights as kind:9802 events that signal content a user finds valuable. The `.content` field contains the highlighted text passage, and tags provide attribution, context, and references to the source material.

## Event Structure

### Basic Highlight

A simple highlight without commentary:

```json
{
  "kind": 9802,
  "content": "This is the highlighted text from the article",
  "tags": [
    ["a", "30023:author-pubkey:article-identifier"],
    ["p", "author-pubkey", "wss://relay.example.com", "author"],
    ["context", "This is the full paragraph containing the highlight for context"],
    ["alt", "Highlight: \"This is the highlighted text from the article\""]
  ]
}
```

### Quote Highlight

A highlight with user commentary (rendered like a quote repost):

```json
{
  "kind": 9802,
  "content": "This is the highlighted text from the article",
  "tags": [
    ["a", "30023:author-pubkey:article-identifier"],
    ["p", "author-pubkey", "wss://relay.example.com", "author"],
    ["comment", "This is why I found this passage interesting and valuable"],
    ["p", "mentioned-user-pubkey", "wss://relay.example.com", "mention"],
    ["alt", "Quote Highlight: \"This is the highlighted text...\" - User commentary"]
  ]
}
```

### URL-Based Highlight

Highlighting content from a web URL (not Nostr-native):

```json
{
  "kind": 9802,
  "content": "Highlighted text from a web article",
  "tags": [
    ["r", "https://example.com/article", "source"],
    ["p", "author-pubkey", "wss://relay.example.com", "author"],
    ["alt", "Highlight from https://example.com/article"]
  ]
}
```

## Tag Reference

### Required Tags

At least one of these must be present:

- **`a` tag**: Reference to addressable Nostr event (e.g., `30023:pubkey:d-tag` for articles)
- **`e` tag**: Reference to regular Nostr event by ID
- **`r` tag**: Reference to external URL

### Attribution Tags

- **`p` tags with `"author"` role**: Credits original content creators
  - Format: `["p", "pubkey", "relay-url", "author"]`
  - Multiple authors can be tagged
- **`p` tags with `"mention"` role**: Used in comments to mention other users
  - Format: `["p", "pubkey", "relay-url", "mention"]`

### Optional Tags

- **`context`**: Surrounding paragraph text for better UX
- **`comment`**: User's commentary on the highlight (makes it a quote highlight)
- **`alt`**: NIP-31 alt text for accessibility

### Tag Attributes

For quote highlights:
- `r` tags from comments: Use `"mention"` attribute
- `r` tag for source: Use `"source"` attribute

## Publishing Highlights

### Using the usePublishHighlight Hook

```tsx
import { usePublishHighlight } from "@/hooks/usePublishHighlight";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function ArticleComponent({ article }: { article: NostrEvent }) {
  const { user } = useCurrentUser();
  const { mutate: publishHighlight, isPending } = usePublishHighlight();

  const handleHighlight = (selectedText: string) => {
    if (!user) {
      // Show login prompt
      return;
    }

    publishHighlight({
      content: selectedText,
      article: article,
      context: extractContext(selectedText, article.content),
    }, {
      onSuccess: () => {
        // Show success toast
      },
      onError: (error) => {
        // Show error toast
      }
    });
  };

  // ... rest of component
}
```

### Publishing Quote Highlights

```tsx
import { usePublishHighlight } from "@/hooks/usePublishHighlight";

function QuoteHighlightDialog({ selectedText, article, onClose }) {
  const [comment, setComment] = useState('');
  const { mutate: publishHighlight } = usePublishHighlight();

  const handleSubmit = () => {
    publishHighlight({
      content: selectedText,
      article: article,
      comment: comment,
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  // ... dialog UI
}
```

## Querying Highlights

### Get Highlights for an Article

```tsx
import { useHighlights } from "@/hooks/useHighlights";

function ArticlePage({ article }: { article: NostrEvent }) {
  const { data: highlights, isLoading } = useHighlights(article.id);

  // highlights is an array of validated kind:9802 events
  return (
    <div>
      {/* Render article with highlights */}
      {highlights?.map(highlight => (
        <HighlightIndicator key={highlight.id} highlight={highlight} />
      ))}
    </div>
  );
}
```

### Get User's Highlights

```tsx
import { useUserHighlights } from "@/hooks/useUserHighlights";

function ProfilePage({ pubkey }: { pubkey: string }) {
  const { data: highlights } = useUserHighlights(pubkey);

  return (
    <div>
      <h2>Highlights</h2>
      {highlights?.map(highlight => (
        <HighlightCard key={highlight.id} highlight={highlight} />
      ))}
    </div>
  );
}
```

## Validation

All highlight events should be validated before use:

```typescript
import { validateHighlight } from "@/lib/validators";
import type { NostrEvent } from "@nostrify/nostrify";

function processHighlights(events: NostrEvent[]) {
  // Filter to only valid highlights
  const validHighlights = events.filter(validateHighlight);
  
  return validHighlights;
}
```

The validator checks:
- Event kind is 9802
- At least one reference tag exists (`a`, `e`, or `r`)
- Tag structure is valid
- Content is present (may be empty for non-text media)

## UI Components

### Text Selection and Highlighting

The application uses native browser text selection with a custom toolbar:

1. User selects text in an article
2. `HighlightButton` appears near the selection
3. Options: "Highlight" or "Quote Highlight"
4. On "Highlight": Creates event immediately
5. On "Quote Highlight": Opens dialog for commentary

### Visual Indicators

Highlighted text is marked with:
- Semi-transparent yellow/amber background
- Hover shows who created highlights
- Click opens `HighlightPopover` with details

### Highlight Popover

Shows when clicking highlighted text:
- List of all highlights for that passage
- Author profile information
- Timestamps
- Comments (for quote highlights)
- Link to navigate to full highlight view

## Best Practices

### Content Length

- Recommended maximum: 500 characters
- For longer passages, consider using `context` tag with full paragraph
- Keep highlights focused on the key insight

### URL Cleaning

When using `r` tags, clean URLs by removing:
- UTM tracking parameters (`?utm_source=`, etc.)
- Session IDs
- Unnecessary query parameters

```typescript
function cleanUrl(url: string): string {
  const urlObj = new URL(url);
  // Remove tracking params
  urlObj.searchParams.delete('utm_source');
  urlObj.searchParams.delete('utm_medium');
  urlObj.searchParams.delete('utm_campaign');
  // ... remove other tracking params
  return urlObj.toString();
}
```

### Attribution

Always include `p` tags with `"author"` role for:
- Article authors
- Content creators
- Original sources

This ensures proper credit and enables discovery.

### Context

Include a `context` tag when:
- Highlight is a subset of a larger paragraph
- Surrounding text adds clarity
- Original structure matters

## Performance Considerations

### Query Optimization

When querying highlights:
- Use appropriate time limits
- Consider pagination for large result sets
- Cache results with TanStack Query

```typescript
const { data: highlights } = useHighlights(articleId, {
  // Refetch every 5 minutes
  staleTime: 5 * 60 * 1000,
  // Cache for 10 minutes
  gcTime: 10 * 60 * 1000,
});
```

### Rendering Optimization

For articles with many highlights:
- Use virtualization for highlight lists
- Lazy-load highlight details
- Debounce hover interactions

## Accessibility

### Alt Text

Always include NIP-31 `alt` tags for screen readers:

```typescript
const altText = comment
  ? `Quote Highlight: "${content.slice(0, 50)}..." - ${comment.slice(0, 50)}`
  : `Highlight: "${content.slice(0, 100)}..."`;

tags.push(["alt", altText]);
```

### Keyboard Navigation

Ensure highlights are keyboard accessible:
- Tab to navigate between highlights
- Enter/Space to open highlight popover
- Escape to close popover

## Future Enhancements

The highlight system can be extended with:

1. **Collections**: Group highlights by theme/topic
2. **Annotations**: Private notes on highlights
3. **Export**: Download highlights as Markdown/PDF
4. **Recommendations**: Suggest highlights based on following graph
5. **Browser Extension**: Highlight any web content
6. **NIP-51 Integration**: Add highlights to bookmark lists
7. **Analytics**: Track highlight engagement for creators

## Examples

### Complete Highlight Flow

```tsx
import { useState } from 'react';
import { usePublishHighlight } from '@/hooks/usePublishHighlight';
import { useHighlights } from '@/hooks/useHighlights';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

export function ArticleWithHighlights({ article }) {
  const [selectedText, setSelectedText] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const { mutate: publishHighlight } = usePublishHighlight();
  const { data: highlights } = useHighlights(article.id);
  const { toast } = useToast();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const handleHighlight = () => {
    publishHighlight({
      content: selectedText,
      article: article,
    }, {
      onSuccess: () => {
        toast({
          title: "Highlight saved!",
          description: "Your highlight has been published",
        });
        setShowToolbar(false);
      }
    });
  };

  return (
    <div onMouseUp={handleTextSelection}>
      <MarkdownContent content={article.content} />
      
      {showToolbar && (
        <div className="fixed bottom-4 right-4">
          <Button onClick={handleHighlight}>
            Highlight
          </Button>
        </div>
      )}
      
      {/* Render highlight indicators */}
      {highlights?.map(highlight => (
        <HighlightIndicator key={highlight.id} highlight={highlight} />
      ))}
    </div>
  );
}
```

## Related NIPs

- **NIP-23**: Long-form content (articles being highlighted)
- **NIP-31**: Alt text for events
- **NIP-51**: Lists (potential future integration)
- **NIP-84**: Highlights (this implementation)

## References

- [NIP-84 Specification](https://github.com/nostr-protocol/nips/blob/master/84.md)
- [Nostr Protocol Documentation](https://github.com/nostr-protocol/nips)
