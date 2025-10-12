import { useSeoMeta } from '@unhead/react';

const Index = () => {
  useSeoMeta({
    title: 'zelo.news - Decentralized News on Nostr',
    description: 'Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.',
    ogTitle: 'zelo.news - Decentralized News on Nostr',
    ogDescription: 'Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.',
    ogType: 'website',
    ogUrl: window.location.href,
    ogImage: `${window.location.origin}/icon-512.png`,
    ogSiteName: 'zelo.news',
    twitterCard: 'summary_large_image',
    twitterTitle: 'zelo.news - Decentralized News on Nostr',
    twitterDescription: 'Your source for decentralized news and articles on the Nostr protocol.',
    twitterImage: `${window.location.origin}/icon-512.png`,
    twitterSite: '@zelo_news',
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Welcome to Your Blank App
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Start building your amazing project here!
        </p>
      </div>
    </div>
  );
};

export default Index;
