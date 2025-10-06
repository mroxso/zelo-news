import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-0 md:py-8">
        {/* Banner skeleton */}
        <Skeleton className="h-48 md:h-64 w-full md:rounded-t-lg" />
        
        {/* Profile info skeleton */}
        <Card className="border-t-0 rounded-t-none md:rounded-t-none">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full -mt-16 md:-mt-20 border-4 border-background" />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-4 w-3/4 max-w-lg" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts skeleton */}
        <div className="mt-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
