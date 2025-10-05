import { useParams, Navigate } from 'react-router-dom';
import { ProfessionalBlogPostForm } from '@/components/ProfessionalBlogPostForm';

export default function EditPostPage() {
  const { identifier } = useParams<{ identifier: string }>();

  if (!identifier) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <ProfessionalBlogPostForm editIdentifier={identifier} />
    </div>
  );
}
