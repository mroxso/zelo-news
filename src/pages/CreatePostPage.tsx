import { useSeoMeta } from '@unhead/react';
import { ProfessionalBlogPostForm } from '@/components/ProfessionalBlogPostForm';

export default function CreatePostPage() {
  useSeoMeta({
    title: 'Create Article - zelo.news',
    description: 'Write and publish a new article on the Nostr network',
    robots: 'noindex', // Don't index editor pages
  });

  return (
    <div className="container max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <ProfessionalBlogPostForm />
    </div>
  );
}
