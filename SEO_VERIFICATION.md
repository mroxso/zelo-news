# SEO Optimization Verification

This document describes the SEO optimizations implemented in zelo.news and how to verify they work correctly.

## What Was Implemented

### 1. Dynamic Page Titles
Each page now has a unique, descriptive title that updates based on content:
- **Article Pages**: `[Article Title] - [Author Name] - zelo.news`
- **Profile Pages**: `[Username] - Profile - zelo.news`
- **Home Page**: `zelo.news - Decentralized News on Nostr`
- **Search Pages**: `Search: [query] - zelo.news` or `Articles tagged #[tag] - zelo.news`
- **Other Pages**: Descriptive titles for bookmarks, following, etc.

### 2. Meta Descriptions
Every page includes a relevant description:
- **Articles**: Uses the article summary, or first 160 characters of content
- **Profiles**: Uses the user's "about" text, or a default description
- **Notes/Events**: Uses the first 160 characters of the content
- **Search**: Includes result count and search term

### 3. Open Graph Tags (for Facebook, LinkedIn, WhatsApp, etc.)
All pages include Open Graph meta tags:
- `og:title` - Page/content title
- `og:description` - Page/content description
- `og:type` - "article" for content pages, "website" for home
- `og:url` - Current page URL
- `og:image` - Article image, profile picture, or default icon
- `og:site_name` - "zelo.news"

Article pages also include:
- `article:published_time` - Publication timestamp
- `article:author` - Author name
- `article:tag` - Article hashtags

### 4. Twitter Card Tags
All pages include Twitter Card meta tags for Twitter/X sharing:
- `twitter:card` - "summary_large_image" for articles, "summary" for others
- `twitter:title` - Page/content title
- `twitter:description` - Page/content description
- `twitter:image` - Article image, profile picture, or default icon
- `twitter:site` - "@zelo_news"

### 5. Additional SEO Features
- Keywords meta tag in base HTML
- Author meta tag in base HTML
- `robots: noindex` for personal pages (bookmarks, following, search results, editor)
- Proper semantic HTML structure

## How to Verify

### Method 1: Browser DevTools
1. Open the application in a browser
2. Open DevTools (F12)
3. Go to the Elements/Inspector tab
4. Look at the `<head>` section
5. You should see dynamically injected meta tags from @unhead

### Method 2: View Page Source
1. Right-click on any page and select "View Page Source"
2. Look for `<meta>` tags in the `<head>`
3. Default tags will be visible in the static HTML
4. Dynamic tags are injected by JavaScript after page load

### Method 3: Social Media Sharing Debuggers
These tools show what social media platforms will see:

**Facebook/Open Graph Debugger:**
- Visit: https://developers.facebook.com/tools/debug/
- Enter a page URL from your deployed site
- Click "Scrape Again" to see the latest meta tags
- Should show article title, description, and image

**Twitter Card Validator:**
- Visit: https://cards-dev.twitter.com/validator
- Enter a page URL from your deployed site
- Should show a preview of how the link will appear on Twitter

**LinkedIn Post Inspector:**
- Visit: https://www.linkedin.com/post-inspector/
- Enter a page URL from your deployed site
- Should show how the link will appear on LinkedIn

### Method 4: Browser Extensions
Install a meta tag viewer extension:
- **SEO Meta in 1 Click** (Chrome/Edge)
- **META SEO inspector** (Firefox)
- These will show all meta tags on the current page

## Example: Article Page Meta Tags

When viewing an article page, the following meta tags should be present:

```html
<title>[Article Title] - [Author Name] - zelo.news</title>
<meta name="description" content="[Article summary or first 160 chars]">
<meta name="author" content="[Author Name]">

<!-- Open Graph -->
<meta property="og:title" content="[Article Title]">
<meta property="og:description" content="[Article summary or first 160 chars]">
<meta property="og:type" content="article">
<meta property="og:url" content="[Current URL]">
<meta property="og:image" content="[Article image or default icon]">
<meta property="og:site_name" content="zelo.news">
<meta property="article:published_time" content="[ISO timestamp]">
<meta property="article:author" content="[Author Name]">
<meta property="article:tag" content="[hashtag1]">
<meta property="article:tag" content="[hashtag2]">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Article Title]">
<meta name="twitter:description" content="[Article summary or first 160 chars]">
<meta name="twitter:image" content="[Article image or default icon]">
<meta name="twitter:site" content="@zelo_news">
```

## Testing Dynamic Content Loading

The SEO implementation handles dynamically loaded content:

1. **Initial Load**: Default meta tags from `index.html` are visible
2. **After Data Loads**: Meta tags are updated with actual content
3. **Social Media Crawlers**: They execute JavaScript and will see the updated tags

To verify this works:
1. Open a page (e.g., an article page)
2. Open DevTools > Network tab
3. Reload the page
4. Watch the meta tags in the Elements tab - they should update as data loads

## Notes

- **Server-Side Rendering**: Currently not implemented. Social media crawlers execute JavaScript, so they will see the dynamically set meta tags.
- **@unhead Library**: This library is SSR-compatible and properly manages meta tags.
- **Image URLs**: Uses absolute URLs so social media platforms can fetch images.
- **Default Fallbacks**: All pages have sensible defaults if content is not available.

## Files Modified

- `index.html` - Updated default meta tags
- `src/pages/ArticlePage.tsx` - Added article-specific SEO
- `src/pages/ProfilePage.tsx` - Added profile-specific SEO
- `src/pages/BlogHomePage.tsx` - Added home page SEO
- `src/pages/SearchResultsPage.tsx` - Added search page SEO (noindex)
- `src/pages/BookmarksPage.tsx` - Added bookmarks page SEO (noindex)
- `src/pages/FollowingPage.tsx` - Added following page SEO (noindex)
- `src/pages/CreatePostPage.tsx` - Added create page SEO (noindex)
- `src/pages/EditPostPage.tsx` - Added edit page SEO (noindex)
- `src/pages/NotePage.tsx` - Added note page SEO
- `src/pages/EventPage.tsx` - Added event page SEO
