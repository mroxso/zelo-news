import { useState } from 'react';
import { useTranslationResults } from '@/hooks/useTranslationResults';
import { useAuthor } from '@/hooks/useAuthor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Languages,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import type { TranslationResult, TranslationFeedback } from '@/hooks/useTranslationResults';

interface TranslationResultsProps {
  /** Event ID of the article */
  eventId: string;
}

/**
 * Display a single translation result
 */
function ResultCard({ result }: { result: TranslationResult }) {
  const author = useAuthor(result.provider);
  const metadata = author.data?.metadata;
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = metadata?.name || genUserName(result.provider);
  const avatarUrl = metadata?.picture;

  const languageNames: Record<string, string> = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    ar: 'Arabic',
    hi: 'Hindi',
    nl: 'Dutch',
    pl: 'Polish',
    tr: 'Turkish',
    vi: 'Vietnamese',
  };

  const languageName = result.language ? languageNames[result.language] || result.language : 'Unknown';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">{displayName}</span>
                <Badge variant="secondary" className="text-xs">
                  <Languages className="h-3 w-3 mr-1" />
                  {languageName}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(result.created_at * 1000, { addSuffix: true })}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {result.content}
            </div>
          </div>
          {result.amount && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Payment requested: {parseInt(result.amount) / 1000} sats</span>
              {result.bolt11 && (
                <Button variant="outline" size="sm" className="ml-auto">
                  Pay Invoice
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Display feedback status
 */
function FeedbackCard({ feedback }: { feedback: TranslationFeedback }) {
  const author = useAuthor(feedback.provider);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(feedback.provider);
  const avatarUrl = metadata?.picture;

  const statusConfig = {
    'payment-required': {
      icon: Zap,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      label: 'Payment Required',
    },
    processing: {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      label: 'Processing',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/20',
      label: 'Error',
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
      label: 'Success',
    },
    partial: {
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      label: 'Partial Result',
    },
  };

  const config = statusConfig[feedback.status];
  const StatusIcon = config.icon;

  return (
    <div className={`p-3 rounded-lg ${config.bg} border border-border/50`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${config.color}`} />
            <span className="font-medium text-sm">{config.label}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {displayName}
            {feedback.statusInfo && ` • ${feedback.statusInfo}`}
          </div>
          {feedback.content && (
            <div className="mt-2 text-sm text-foreground/80">
              {feedback.content}
            </div>
          )}
          {feedback.amount && (
            <Button variant="outline" size="sm" className="mt-2">
              <Zap className="h-3 w-3 mr-1 text-yellow-500" />
              Pay {parseInt(feedback.amount) / 1000} sats
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Display all translation results and feedback for an article
 */
export function TranslationResults({ eventId }: TranslationResultsProps) {
  const { data, isLoading } = useTranslationResults(eventId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data || (data.results.length === 0 && data.feedback.length === 0)) {
    return null; // Don't show anything if there are no results
  }

  return (
    <div className="space-y-6">
      {/* Translation Results */}
      {data.results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            Available Translations
          </h3>
          <div className="space-y-3">
            {data.results.map((result) => (
              <ResultCard key={result.event.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Job Feedback */}
      {data.feedback.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Translation Status Updates
          </h3>
          <div className="space-y-2">
            {data.feedback.map((fb) => (
              <FeedbackCard key={fb.event.id} feedback={fb} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
