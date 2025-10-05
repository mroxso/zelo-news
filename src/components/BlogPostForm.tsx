import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePublishBlogPost } from '@/hooks/usePublishBlogPost';
import { useBlogPost } from '@/hooks/useBlogPost';
import { useUploadFile } from '@/hooks/useUploadFile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BlogPostFormProps {
  /** Existing post identifier for editing (optional) */
  editIdentifier?: string;
}

export function BlogPostForm({ editIdentifier }: BlogPostFormProps) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { mutateAsync: publishPost, isPending: isPublishing } = usePublishBlogPost();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

  // Load existing post if editing (using the current user's pubkey)
  const { data: existingPost } = useBlogPost(
    user?.pubkey || '',
    editIdentifier || ''
  );

  const [formData, setFormData] = useState({
    identifier: '',
    title: '',
    summary: '',
    image: '',
    content: '',
    hashtags: '',
  });

  // Load existing post data when editing
  useEffect(() => {
    if (existingPost && editIdentifier) {
      const d = existingPost.tags.find(([name]) => name === 'd')?.[1] || '';
      const title = existingPost.tags.find(([name]) => name === 'title')?.[1] || '';
      const summary = existingPost.tags.find(([name]) => name === 'summary')?.[1] || '';
      const image = existingPost.tags.find(([name]) => name === 'image')?.[1] || '';
      const hashtags = existingPost.tags
        .filter(([name]) => name === 't')
        .map(([, value]) => value)
        .join(', ');

      setFormData({
        identifier: d,
        title,
        summary,
        image,
        content: existingPost.content,
        hashtags,
      });
    }
  }, [existingPost, editIdentifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const publishedAt = editIdentifier && existingPost
        ? parseInt(existingPost.tags.find(([name]) => name === 'published_at')?.[1] || '0')
        : Math.floor(Date.now() / 1000);

      const event = await publishPost({
        identifier: formData.identifier,
        title: formData.title,
        summary: formData.summary || undefined,
        image: formData.image || undefined,
        content: formData.content,
        hashtags: formData.hashtags
          ? formData.hashtags.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
        publishedAt: publishedAt || undefined,
      });

      // Navigate to the post
      const naddr = nip19.naddrEncode({
        kind: 30023,
        pubkey: event.pubkey,
        identifier: formData.identifier,
      });
      navigate(`/${naddr}`);
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const [[_, url]] = await uploadFile(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to create a blog post.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if user is trying to edit someone else's post
  if (editIdentifier && existingPost && existingPost.pubkey !== user.pubkey) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You can only edit your own posts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editIdentifier ? 'Edit Post' : 'Create New Post'}</CardTitle>
        <CardDescription>
          {editIdentifier ? 'Update your blog post' : 'Write a new blog post in Markdown format'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier">
              Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="identifier"
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
              placeholder="my-first-post"
              required
              disabled={!!editIdentifier}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this post (URL-friendly, e.g., "my-first-post")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="My Amazing Blog Post"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="A brief summary of your post..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Cover Image</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button type="button" variant="outline" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {formData.image && (
              <img
                src={formData.image}
                alt="Cover preview"
                className="mt-2 rounded-lg max-h-48 object-cover w-full"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content (Markdown) <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your post content in Markdown..."
              rows={15}
              required
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown formatting. Use nostr: links for Nostr references.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
              placeholder="bitcoin, nostr, technology"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of tags
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                editIdentifier ? 'Update Post' : 'Publish Post'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
