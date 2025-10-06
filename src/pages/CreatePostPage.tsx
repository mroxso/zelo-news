import { ProfessionalBlogPostForm } from '@/components/ProfessionalBlogPostForm';
import { usePageSEO } from '@/hooks/usePageSEO';

export default function CreatePostPage() {
  usePageSEO({
    title: 'Create Article',
    description: 'Write and publish your own decentralized article on Nostr. Share your thoughts with censorship-resistant publishing.',
    robots: 'noindex, nofollow',
  });

  return (
    <div className="container max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <ProfessionalBlogPostForm />
    </div>
  );
}
