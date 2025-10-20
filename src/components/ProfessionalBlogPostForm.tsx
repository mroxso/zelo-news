import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { SerializedEditorState } from 'lexical';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePublishBlogPost } from '@/hooks/usePublishBlogPost';
import { useLongFormContentNote } from '@/hooks/useLongFormContentNote';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Upload, Image as ImageIcon, FileText, Hash, Calendar } from 'lucide-react';
import { Editor } from '@/components/blocks/editor-00/editor';

interface ProfessionalBlogPostFormProps {
  /** Existing post identifier for editing (optional) */
  editIdentifier?: string;
}

const initialEditorState = {
  root: {
    children: [
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

export function ProfessionalBlogPostForm({ editIdentifier }: ProfessionalBlogPostFormProps) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { mutateAsync: publishPost, isPending: isPublishing } = usePublishBlogPost();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

  // Load existing post if editing (using the current user's pubkey)
  const { data: existingPost, isLoading: isLoadingPost } = useLongFormContentNote(
    user?.pubkey || '',
    editIdentifier || ''
  );

  const [editorState, setEditorState] = useState<SerializedEditorState>(initialEditorState);
  const [metadata, setMetadata] = useState({
    identifier: '',
    title: '',
    summary: '',
    image: '',
    hashtags: '',
  });
  const [showMetadata, setShowMetadata] = useState(true);

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

      setMetadata({
        identifier: d,
        title,
        summary,
        image,
        hashtags,
      });

      // Convert markdown content to editor state
      // We'll use a simple approach - the editor will handle the markdown
      // For now, we'll just set it as the initial state
      if (existingPost.content) {
        try {
          // Create a simple editor state with the markdown content as text
          // The Lexical markdown plugin should handle conversion
          const contentState = {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: existingPost.content,
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "paragraph",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          } as unknown as SerializedEditorState;
          setEditorState(contentState);
        } catch (error) {
          console.error('Failed to parse existing content:', error);
        }
      }
    }
  }, [existingPost, editIdentifier]);

  const handleMetadataChange = (field: keyof typeof metadata, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const [[_, url]] = await uploadFile(file);
      setMetadata(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const getMarkdownFromEditor = (): string => {
    // Extract text content from the editor state
    // In a full implementation, you'd use $convertToMarkdownString with proper transformers
    try {
      interface EditorNode {
        children?: Array<{ text?: string }>;
      }
      
      const root = editorState.root as { children?: EditorNode[] };
      const content = (root.children || [])
        .map((child: EditorNode) => {
          if (child.children && Array.isArray(child.children)) {
            return child.children
              .map((textNode) => textNode.text || '')
              .join('');
          }
          return '';
        })
        .join('\n\n');
      return content;
    } catch (error) {
      console.error('Failed to extract markdown:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!metadata.identifier.trim()) {
      alert('Please provide a unique identifier for your post');
      return;
    }

    if (!metadata.title.trim()) {
      alert('Please provide a title for your post');
      return;
    }

    const markdownContent = getMarkdownFromEditor();
    
    if (!markdownContent.trim()) {
      alert('Please write some content for your post');
      return;
    }

    try {
      const publishedAt = editIdentifier && existingPost
        ? parseInt(existingPost.tags.find(([name]) => name === 'published_at')?.[1] || '0')
        : Math.floor(Date.now() / 1000);

      const event = await publishPost({
        identifier: metadata.identifier,
        title: metadata.title,
        summary: metadata.summary || undefined,
        image: metadata.image || undefined,
        content: markdownContent,
        hashtags: metadata.hashtags
          ? metadata.hashtags.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
        publishedAt: publishedAt || undefined,
      });

      // Navigate to the post
      const naddr = nip19.naddrEncode({
        kind: 30023,
        pubkey: event.pubkey,
        identifier: metadata.identifier,
      });
      navigate(`/${naddr}`);
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post. Please try again.');
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

  if (isLoadingPost) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editIdentifier ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {editIdentifier ? 'Update your article' : 'Share your thoughts with the world'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              editIdentifier ? 'Update Article' : 'Publish Article'
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Metadata Section */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowMetadata(!showMetadata)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Article Metadata
            </CardTitle>
            <Button variant="ghost" size="sm">
              {showMetadata ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showMetadata && (
          <CardContent className="space-y-6">
            {/* Identifier */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Identifier <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identifier"
                value={metadata.identifier}
                onChange={(e) => handleMetadataChange('identifier', e.target.value)}
                placeholder="my-awesome-article"
                required
                disabled={!!editIdentifier}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (e.g., "my-awesome-article"). Cannot be changed after publishing.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="The Amazing Story of..."
                required
                className="text-lg"
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">
                Summary
              </Label>
              <Textarea
                id="summary"
                value={metadata.summary}
                onChange={(e) => handleMetadataChange('summary', e.target.value)}
                placeholder="A compelling summary that will appear in previews and search results..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Brief description of your article (recommended for better discoverability)
              </p>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Cover Image
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={metadata.image}
                  onChange={(e) => handleMetadataChange('image', e.target.value)}
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
              {metadata.image && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img
                    src={metadata.image}
                    alt="Cover preview"
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label htmlFor="hashtags" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Topics & Tags
              </Label>
              <Input
                id="hashtags"
                value={metadata.hashtags}
                onChange={(e) => handleMetadataChange('hashtags', e.target.value)}
                placeholder="bitcoin, technology, innovation"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags to help readers discover your content
              </p>
            </div>

            {editIdentifier && existingPost && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Originally published: {new Date(parseInt(existingPost.tags.find(([name]) => name === 'published_at')?.[1] || '0') * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Editor Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div >
            <Editor
              editorSerializedState={editorState}
              onSerializedChange={(value) => setEditorState(value)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Write your article using the rich text editor. Markdown formatting is supported.
          </p>
        </CardContent>
      </Card>

      {/* Mobile Action Buttons */}
      {isMobile && (
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPublishing}
                className="flex-1"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  editIdentifier ? 'Update' : 'Publish'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
