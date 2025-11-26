import { useState } from 'react';
import { Plus, Trash2, Edit2, Hash, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInterestSets, type InterestSet } from '@/hooks/useInterestSets';
import { usePublishInterestSet } from '@/hooks/usePublishInterestSet';
import { useDeleteInterestSet } from '@/hooks/useDeleteInterestSet';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';

interface InterestSetFormData {
  identifier: string;
  title: string;
  image: string;
  description: string;
  hashtags: string[];
}

const defaultFormData: InterestSetFormData = {
  identifier: '',
  title: '',
  image: '',
  description: '',
  hashtags: [],
};

function InterestSetDialog({ 
  interestSet, 
  trigger, 
  onSuccess 
}: { 
  interestSet?: InterestSet; 
  trigger: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InterestSetFormData>(
    interestSet 
      ? {
          identifier: interestSet.identifier,
          title: interestSet.title || '',
          image: interestSet.image || '',
          description: interestSet.description || '',
          hashtags: interestSet.hashtags,
        }
      : defaultFormData
  );
  const [hashtagInput, setHashtagInput] = useState('');

  const { mutate: publishInterestSet, isPending } = usePublishInterestSet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identifier.trim()) {
      return;
    }

    publishInterestSet(
      {
        identifier: formData.identifier.trim(),
        title: formData.title.trim() || undefined,
        image: formData.image.trim() || undefined,
        description: formData.description.trim() || undefined,
        hashtags: formData.hashtags,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData(defaultFormData);
          setHashtagInput('');
          onSuccess?.();
        },
      }
    );
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !formData.hashtags.includes(tag)) {
      setFormData({ ...formData, hashtags: [...formData.hashtags, tag] });
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter((h) => h !== hashtag),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {interestSet ? 'Edit Interest Set' : 'Create Interest Set'}
          </DialogTitle>
          <DialogDescription>
            Group hashtags together to organize your interests. These will appear as sections on your homepage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">
              Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="identifier"
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              placeholder="e.g., tech, entertainment"
              required
              disabled={!!interestSet}
            />
            <p className="text-xs text-muted-foreground">
              A unique identifier for this set. Cannot be changed after creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Technology & Innovation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this interest set is about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">
              Hashtags <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="hashtags"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a hashtag and press Enter"
              />
              <Button type="button" onClick={handleAddHashtag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.hashtags.map((hashtag) => (
                  <Badge key={hashtag} variant="secondary" className="gap-1">
                    <Hash className="h-3 w-3" />
                    {hashtag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(hashtag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              At least one hashtag is required.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || formData.hashtags.length === 0}>
              {isPending ? 'Saving...' : interestSet ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InterestSetsManager() {
  const { user } = useCurrentUser();
  const { data: interestSets, isLoading, refetch, isFetching } = useInterestSets();
  const { mutate: deleteInterestSet } = useDeleteInterestSet();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Refreshed',
        description: 'Interest sets have been updated.',
      });
    } catch (error) {
      console.error('Failed to refresh interest sets:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh interest sets.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You must be logged in to manage interest sets.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleDelete = (interestSet: InterestSet) => {
    if (confirm(`Are you sure you want to delete "${interestSet.title || interestSet.identifier}"?`)) {
      deleteInterestSet(interestSet.event);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading || isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <InterestSetDialog
            trigger={
              <Button variant={"outline"}>
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>

      {!interestSets || interestSets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No interest sets yet. Create your first one to customize your homepage.
            </p>
            <InterestSetDialog
              trigger={
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Interest Set
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interestSets.map((interestSet) => (
            <Card key={interestSet.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {interestSet.title || interestSet.identifier}
                      <Badge variant="outline" className="font-normal">
                        {interestSet.identifier}
                      </Badge>
                    </CardTitle>
                    {interestSet.description && (
                      <CardDescription className="mt-1">
                        {interestSet.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <InterestSetDialog
                      interestSet={interestSet}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(interestSet)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interestSet.hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="secondary">
                      <Hash className="h-3 w-3 mr-1" />
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
