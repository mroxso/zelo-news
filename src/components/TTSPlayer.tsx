import { useState } from 'react';
import { Play, Volume2, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTTSJobs, useRequestTTS, useJobFeedback } from '@/hooks/useDVMTTS';
import { DVMSelectorButton } from '@/components/DVMSelector';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';

interface TTSPlayerProps {
  articleEvent: NostrEvent;
  className?: string;
}

export function TTSPlayer({ articleEvent, className }: TTSPlayerProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { data: jobs, isLoading: jobsLoading } = useTTSJobs(articleEvent);
  const { mutate: requestTTS, isPending: isRequesting, activeJobRequestId, clearActiveJob } = useRequestTTS();
  const { data: feedback } = useJobFeedback(activeJobRequestId);
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);

  // Get the latest feedback status
  const latestFeedback = feedback?.[0];
  const isProcessing = latestFeedback?.status === 'processing';
  const paymentRequired = latestFeedback?.status === 'payment-required';
  const hasError = latestFeedback?.status === 'error';

  const handleRequestTTS = (providerPubkey: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to request text-to-speech conversion.',
        variant: 'destructive',
      });
      return;
    }

    requestTTS({
      articleEvent,
      providerPubkey,
      language: 'en', // Could be made configurable
    });
  };

  const handlePayment = () => {
    if (latestFeedback?.bolt11) {
      // Open lightning URL
      window.open(`lightning:${latestFeedback.bolt11}`, '_blank');
    }
  };

  const handleSelectJob = (index: number) => {
    setSelectedJobIndex(index);
  };

  if (jobsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasJobs = jobs && jobs.length > 0;
  const selectedJob = jobs?.[selectedJobIndex];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Listen to Article
          </CardTitle>
          {hasJobs && (
            <Badge variant="secondary">
              {jobs.length} version{jobs.length > 1 ? 's' : ''} available
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show active job status */}
        {activeJobRequestId && !hasError && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {isProcessing || isRequesting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Processing your request...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestFeedback?.statusInfo || 'Waiting for service provider to process the article'}
                    </p>
                  </div>
                </>
              ) : paymentRequired ? (
                <>
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Payment Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestFeedback?.statusInfo || 'The service provider requires payment to continue'}
                    </p>
                    {latestFeedback?.amountMillisats && (
                      <p className="text-xs font-medium mt-1">
                        Amount: {Math.floor(latestFeedback.amountMillisats / 1000)} sats
                      </p>
                    )}
                  </div>
                  {latestFeedback?.bolt11 && (
                    <Button size="sm" onClick={handlePayment}>
                      <Zap className="h-4 w-4 mr-2" />
                      Pay
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-sm">Waiting for response...</p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActiveJob}
              className="mt-3 w-full"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Show error */}
        {hasError && latestFeedback && (
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <p className="font-medium text-sm text-destructive">Error Processing Request</p>
            <p className="text-xs text-muted-foreground mt-1">
              {latestFeedback.statusInfo || latestFeedback.content || 'The service provider encountered an error'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearActiveJob}
              className="mt-3"
            >
              Dismiss
            </Button>
          </div>
        )}

        {hasJobs ? (
          <>
            {/* Audio Player */}
            {selectedJob && (
              <div className="space-y-3">
                <audio
                  key={selectedJob.audioUrl}
                  controls
                  className="w-full"
                  src={selectedJob.audioUrl}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    Provider: {selectedJob.providerNpub.slice(0, 12)}...
                  </div>
                  <div>
                    {new Date(selectedJob.createdAt * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {/* Multiple results selector */}
            {jobs.length > 1 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Choose TTS Version</p>
                  <div className="space-y-2">
                    {jobs.map((job, index) => (
                      <button
                        key={job.event.id}
                        onClick={() => handleSelectJob(index)}
                        className={`w-full p-3 border rounded-lg text-left transition-all hover:border-primary ${
                          selectedJobIndex === index ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span className="text-sm">
                              Version {index + 1}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(job.createdAt * 1000).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {job.providerNpub.slice(0, 16)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Request another TTS button */}
            <Separator />
            <div className="flex items-center justify-center">
              <DVMSelectorButton
                onConfirm={handleRequestTTS}
                buttonText="Request Another TTS"
                disabled={isRequesting || !user}
              />
            </div>
          </>
        ) : (
          /* No jobs yet - show request button */
          <div className="text-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              No audio version available yet. Request a text-to-speech conversion from a DVM service provider.
            </p>
            <DVMSelectorButton
              onConfirm={handleRequestTTS}
              buttonText="Request TTS Conversion"
              disabled={isRequesting || !user}
            />
            {!user && (
              <p className="text-xs text-muted-foreground">
                Please log in to request TTS conversion
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
