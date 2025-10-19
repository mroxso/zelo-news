import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { ProfessionalBlogPostForm } from '@/components/ProfessionalBlogPostForm';

export default function EditPostPage() {
  const { identifier } = useParams<{ identifier: string }>();

  useSeoMeta({
    title: 'Edit Article - zelo.news',
    description: 'Edit your article on the Nostr network',
    robots: 'noindex', // Don't index editor pages
  });

  if (!identifier) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <ProfessionalBlogPostForm editIdentifier={identifier} />
    </div>
  );
}
