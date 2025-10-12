# SEO Implementation Examples

This document shows concrete examples of how the SEO meta tags appear on different pages of zelo.news.

## Example 1: Article Page

When viewing an article titled "The Future of Decentralized Social Media" by Alice:

### What Gets Rendered:
```html
<head>
  <title>The Future of Decentralized Social Media - Alice - zelo.news</title>
  <meta name="description" content="Exploring how Nostr and other decentralized protocols are reshaping social media. This article covers the key advantages and challenges...">
  <meta name="author" content="Alice">
  
  <!-- Open Graph for Facebook, LinkedIn, WhatsApp -->
  <meta property="og:title" content="The Future of Decentralized Social Media">
  <meta property="og:description" content="Exploring how Nostr and other decentralized protocols are reshaping social media...">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://zelo.news/naddr1...">
  <meta property="og:image" content="https://example.com/article-image.jpg">
  <meta property="og:site_name" content="zelo.news">
  <meta property="article:published_time" content="2025-10-12T10:30:00.000Z">
  <meta property="article:author" content="Alice">
  <meta property="article:tag" content="nostr">
  <meta property="article:tag" content="decentralization">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="The Future of Decentralized Social Media">
  <meta name="twitter:description" content="Exploring how Nostr and other decentralized protocols...">
  <meta name="twitter:image" content="https://example.com/article-image.jpg">
  <meta name="twitter:site" content="@zelo_news">
</head>
```

### What This Looks Like When Shared:

**WhatsApp Preview:**
```
┌─────────────────────────────────────────┐
│ [Article Image]                         │
├─────────────────────────────────────────┤
│ The Future of Decentralized Social      │
│ Media                                    │
│ Exploring how Nostr and other           │
│ decentralized protocols are reshaping   │
│ social media...                          │
│ zelo.news                                │
└─────────────────────────────────────────┘
```

**Twitter/X Preview:**
```
┌─────────────────────────────────────────┐
│ [Large Article Image]                   │
├─────────────────────────────────────────┤
│ The Future of Decentralized Social      │
│ Media                                    │
│ Exploring how Nostr and other           │
│ decentralized protocols...               │
│ 🔗 zelo.news                             │
└─────────────────────────────────────────┘
```

## Example 2: Profile Page

When viewing Bob's profile who has published 15 articles:

### What Gets Rendered:
```html
<head>
  <title>Bob - Profile - zelo.news</title>
  <meta name="description" content="Bitcoin enthusiast and writer exploring decentralized systems. • 15 articles published">
  <meta name="author" content="Bob">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Bob on zelo.news">
  <meta property="og:description" content="Bitcoin enthusiast and writer exploring decentralized systems. • 15 articles published">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="https://zelo.news/npub1...">
  <meta property="og:image" content="https://example.com/bob-avatar.jpg">
  <meta property="og:site_name" content="zelo.news">
  <meta property="profile:username" content="bob@nostr.com">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Bob on zelo.news">
  <meta name="twitter:description" content="Bitcoin enthusiast and writer exploring decentralized systems. • 15 articles published">
  <meta name="twitter:image" content="https://example.com/bob-avatar.jpg">
  <meta name="twitter:site" content="@zelo_news">
</head>
```

### What This Looks Like When Shared:

**Facebook/LinkedIn Preview:**
```
┌─────────────────────────────────────────┐
│ [Bob's Profile Banner or Avatar]        │
├─────────────────────────────────────────┤
│ Bob on zelo.news                         │
│ Bitcoin enthusiast and writer exploring  │
│ decentralized systems. • 15 articles     │
│ published                                │
│ 🔗 ZELO.NEWS                             │
└─────────────────────────────────────────┘
```

## Example 3: Home Page

When viewing the home page:

### What Gets Rendered:
```html
<head>
  <title>zelo.news - Decentralized News on Nostr</title>
  <meta name="description" content="Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.">
  <meta name="keywords" content="nostr, decentralized, news, articles, blog, bitcoin, lightning, web3">
  <meta name="author" content="zelo.news">
  
  <!-- Open Graph -->
  <meta property="og:title" content="zelo.news - Decentralized News on Nostr">
  <meta property="og:description" content="Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://zelo.news/">
  <meta property="og:image" content="https://zelo.news/icon-512.png">
  <meta property="og:site_name" content="zelo.news">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="zelo.news - Decentralized News on Nostr">
  <meta name="twitter:description" content="Your source for decentralized news and articles on the Nostr protocol.">
  <meta name="twitter:image" content="https://zelo.news/icon-512.png">
  <meta name="twitter:site" content="@zelo_news">
</head>
```

## Example 4: Search Results Page

When searching for "bitcoin":

### What Gets Rendered:
```html
<head>
  <title>Search: bitcoin - zelo.news</title>
  <meta name="description" content="Found 42 results for 'bitcoin' on zelo.news">
  <meta name="robots" content="noindex">
  <!-- Note: robots: noindex prevents search engines from indexing search results -->
</head>
```

## Example 5: Note Page (Short Post)

When viewing a short text note from Charlie:

### What Gets Rendered:
```html
<head>
  <title>Charlie's note - zelo.news</title>
  <meta name="description" content="Just published my thoughts on the future of decentralized identity. Check out my latest article!">
  <meta name="author" content="Charlie">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Note by Charlie">
  <meta property="og:description" content="Just published my thoughts on the future of decentralized identity. Check out my latest article!">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://zelo.news/note1...">
  <meta property="og:image" content="https://example.com/charlie-avatar.jpg">
  <meta property="og:site_name" content="zelo.news">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Note by Charlie">
  <meta name="twitter:description" content="Just published my thoughts on the future of decentralized identity...">
  <meta name="twitter:image" content="https://example.com/charlie-avatar.jpg">
  <meta name="twitter:site" content="@zelo_news">
</head>
```

## Benefits of This Implementation

### 1. Better Search Engine Rankings
- Unique titles for every page
- Descriptive meta descriptions
- Proper semantic HTML structure
- Keywords in meta tags

### 2. Rich Social Media Previews
When users share links on:
- **WhatsApp**: Shows article image, title, and description
- **Facebook**: Rich preview with image, title, and description
- **Twitter/X**: Large image card with content preview
- **LinkedIn**: Professional preview with article details
- **Discord**: Embedded preview with image and text
- **Slack**: Link unfurling with full preview
- **Telegram**: Rich message preview

### 3. Dynamic Content Handling
- Meta tags update automatically when content loads
- Fallback values ensure something always displays
- Social media crawlers execute JavaScript and see updated tags

### 4. Professional Appearance
- Consistent branding across all social platforms
- Author attribution on all content
- Timestamp information for articles
- Category tags for better discovery

## Testing Your Implementation

### Quick Test with Twitter
1. Copy any article URL from your deployed site
2. Paste it into a new tweet
3. Twitter will show a preview - you should see the article image, title, and description

### Full Test with Facebook Debugger
1. Go to https://developers.facebook.com/tools/debug/
2. Enter any page URL from your deployed site
3. Click "Scrape Again"
4. Review the preview - should show all meta tags and image

### Verify in Browser
1. Open any page
2. Right-click → Inspect
3. Go to Elements tab
4. Look at `<head>` section
5. Should see all meta tags listed above

## Common Issues and Solutions

### Issue: Social preview not updating
**Solution**: Use the social media debuggers to force a re-scrape
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### Issue: Image not showing in preview
**Solution**: Ensure images use absolute URLs (https://...) not relative (/image.jpg)

### Issue: Old title/description showing
**Solution**: Clear browser cache or test in incognito mode

## Conclusion

The SEO implementation provides:
✅ Professional social media previews on all platforms
✅ Better search engine visibility
✅ Dynamic updates for Nostr content
✅ Proper handling of images and descriptions
✅ Consistent branding across the web

All without requiring server-side rendering - it works entirely in the browser with the @unhead library!
