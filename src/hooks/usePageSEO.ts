import { useEffect } from 'react';

export interface PageSEOConfig {
  /** Page title (will be appended with " | zelo.news") */
  title?: string;
  /** Page description for meta tag */
  description?: string;
  /** Keywords for the page */
  keywords?: string[];
  /** Canonical URL (defaults to current URL) */
  canonical?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph type (defaults to "website") */
  ogType?: 'website' | 'article' | 'profile';
  /** Article specific metadata */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  /** Twitter card type (defaults to "summary_large_image") */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Robots meta tag instructions */
  robots?: string;
}

/**
 * Hook to manage page-level SEO metadata.
 * Updates document title and meta tags dynamically.
 */
export function usePageSEO(config: PageSEOConfig) {
  useEffect(() => {
    const siteName = 'zelo.news';
    const baseTitle = 'zelo.news - Your Source for Decentralized News';
    const fullTitle = config.title ? `${config.title} | ${siteName}` : baseTitle;
    
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let tag = document.querySelector(`meta[${attribute}="${selector}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, selector);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update description
    if (config.description) {
      updateMetaTag('description', config.description);
      updateMetaTag('og:description', config.description, 'property');
      updateMetaTag('twitter:description', config.description);
    }

    // Update keywords
    if (config.keywords && config.keywords.length > 0) {
      updateMetaTag('keywords', config.keywords.join(', '));
    }

    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:type', config.ogType || 'website', 'property');
    
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, 'property');
      updateMetaTag('twitter:image', config.ogImage);
    }

    // Update canonical URL
    const canonicalUrl = config.canonical || window.location.href;
    updateMetaTag('og:url', canonicalUrl, 'property');
    
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);

    // Update robots meta tag
    if (config.robots) {
      updateMetaTag('robots', config.robots);
    }

    // Article-specific metadata
    if (config.article) {
      if (config.article.publishedTime) {
        updateMetaTag('article:published_time', config.article.publishedTime, 'property');
      }
      if (config.article.modifiedTime) {
        updateMetaTag('article:modified_time', config.article.modifiedTime, 'property');
      }
      if (config.article.author) {
        updateMetaTag('article:author', config.article.author, 'property');
      }
      if (config.article.section) {
        updateMetaTag('article:section', config.article.section, 'property');
      }
      if (config.article.tags) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove());
        // Add new tags
        config.article.tags.forEach(tag => {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'article:tag');
          metaTag.setAttribute('content', tag);
          document.head.appendChild(metaTag);
        });
      }
    }

    // Cleanup function - restore defaults on unmount
    return () => {
      document.title = baseTitle;
    };
  }, [config]);
}
