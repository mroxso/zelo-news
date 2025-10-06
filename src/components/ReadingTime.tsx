import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

/**
 * Displays estimated reading time for an article
 * Format: "🕒 X min read"
 */
export function ReadingTime({ minutes, className }: ReadingTimeProps) {
  return (
    <div 
      className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
      aria-label={`Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`}
    >
      <Clock className="h-4 w-4" aria-hidden="true" />
      <span>{minutes} min read</span>
    </div>
  );
}
