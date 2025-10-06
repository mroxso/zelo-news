import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ArticleProgressBarProps {
  className?: string;
}

/**
 * Sticky progress bar that shows reading progress through the article
 * Positioned at the top of viewport and fills from 0% to 100% as user scrolls
 */
export function ArticleProgressBar({ className }: ArticleProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateProgress = () => {
      // Get the article content element (the main scrollable content)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate how far through the document we've scrolled
      // Subtract window height to account for viewport
      const scrollableHeight = documentHeight - windowHeight;
      
      if (scrollableHeight <= 0) {
        setProgress(100);
        return;
      }
      
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;
      
      // Clamp between 0 and 100
      const clampedProgress = Math.min(100, Math.max(0, scrollPercentage));
      setProgress(clampedProgress);
    };

    // Calculate initial progress
    calculateProgress();

    // Update on scroll - use passive listener for better performance
    window.addEventListener('scroll', calculateProgress, { passive: true });
    
    // Update on resize in case content height changes
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);

  return (
    <div
      ref={progressRef}
      className={cn(
        'sticky top-0 left-0 right-0 z-40 h-1 bg-muted',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`You have read ${Math.round(progress)}% of this article`}
    >
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
