import { useParams, Navigate } from 'react-router-dom';
import { BlogPostForm } from '@/components/BlogPostForm';

export default function EditPostPage() {
  const { identifier } = useParams<{ identifier: string }>();

  if (!identifier) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container max-w-4xl py-8">
      <BlogPostForm editIdentifier={identifier} />
    </div>
  );
}
