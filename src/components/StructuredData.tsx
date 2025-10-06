import { useEffect } from 'react';

export interface ArticleStructuredData {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  url: string;
}

export interface WebsiteStructuredData {
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export interface ProfileStructuredData {
  name: string;
  description?: string;
  image?: string;
  url: string;
  sameAs?: string[];
}

/**
 * Component to inject JSON-LD structured data into the page.
 * Use this for articles, profiles, and other structured content.
 */
export function StructuredData({ 
  type, 
  data 
}: { 
  type: 'article' | 'website' | 'profile';
  data: ArticleStructuredData | WebsiteStructuredData | ProfileStructuredData;
}) {
  useEffect(() => {
    const scriptId = 'structured-data';
    
    // Remove existing structured data
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create structured data based on type
    let structuredData: Record<string, unknown> = {
      '@context': 'https://schema.org',
    };

    if (type === 'article') {
      const articleData = data as ArticleStructuredData;
      structuredData = {
        ...structuredData,
        '@type': 'Article',
        headline: articleData.headline,
        description: articleData.description,
        image: articleData.image,
        datePublished: articleData.datePublished,
        dateModified: articleData.dateModified || articleData.datePublished,
        author: {
          '@type': 'Person',
          name: articleData.author.name,
          url: articleData.author.url,
        },
        publisher: {
          '@type': 'Organization',
          name: articleData.publisher.name,
          logo: {
            '@type': 'ImageObject',
            url: articleData.publisher.logo,
          },
        },
        url: articleData.url,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleData.url,
        },
      };
    } else if (type === 'website') {
      const websiteData = data as WebsiteStructuredData;
      structuredData = {
        ...structuredData,
        '@type': 'WebSite',
        name: websiteData.name,
        description: websiteData.description,
        url: websiteData.url,
        ...(websiteData.logo && { logo: websiteData.logo }),
        ...(websiteData.sameAs && { sameAs: websiteData.sameAs }),
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${websiteData.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
    } else if (type === 'profile') {
      const profileData = data as ProfileStructuredData;
      structuredData = {
        ...structuredData,
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: profileData.name,
          description: profileData.description,
          image: profileData.image,
          url: profileData.url,
          ...(profileData.sameAs && { sameAs: profileData.sameAs }),
        },
      };
    }

    // Create and inject script tag
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}
