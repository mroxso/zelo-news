import { useState } from 'react';
import { useTranslationDVMs } from '@/hooks/useTranslationDVMs';
import { useAuthor } from '@/hooks/useAuthor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import type { TranslationDVM } from '@/hooks/useTranslationDVMs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TranslationBannerProps {
  /** Event ID of the article to translate */
  eventId: string;
  /** Callback when translation is requested */
  onTranslate: (dvmPubkey: string, language: string) => void;
}

/**
 * Individual DVM card in the scrolling banner
 */
function DVMCard({ dvm, onClick }: { dvm: TranslationDVM; onClick: () => void }) {
  const author = useAuthor(dvm.pubkey);
  const metadata = author.data?.metadata;

  const displayName = dvm.metadata.name || metadata?.name || genUserName(dvm.pubkey);
  const avatarUrl = dvm.metadata.picture || dvm.metadata.image || metadata?.picture;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors min-w-[100px] group"
    >
      <Avatar className="h-12 w-12 ring-2 ring-background group-hover:ring-primary/50 transition-all">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="text-xs font-medium text-center line-clamp-2 max-w-[100px]">
        {displayName}
      </div>
    </button>
  );
}

/**
 * Scrolling banner component for selecting translation DVMs
 */
export function TranslationBanner({ eventId, onTranslate }: TranslationBannerProps) {
  const { data: dvms, isLoading } = useTranslationDVMs();
  const [selectedDVM, setSelectedDVM] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDVMSelect = (dvmPubkey: string) => {
    setSelectedDVM(dvmPubkey);
  };

  const handleTranslate = () => {
    if (selectedDVM) {
      onTranslate(selectedDVM, targetLanguage);
      setIsExpanded(false);
    }
  };

  // Common languages for translation
  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
  ];

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dvms || dvms.length === 0) {
    return null; // Don't show the banner if no DVMs are available
  }

  return (
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        {/* Header with toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Translate this article</div>
              <div className="text-xs text-muted-foreground">
                {dvms.length} translation service{dvms.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Scrolling DVM banner */}
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2 min-w-max">
                  {/* Animate the scrolling effect with CSS */}
                  <div className="flex gap-2 animate-scroll-rtl">
                    {dvms.map((dvm) => (
                      <div
                        key={dvm.pubkey}
                        className={`${
                          selectedDVM === dvm.pubkey
                            ? 'ring-2 ring-primary rounded-lg'
                            : ''
                        }`}
                      >
                        <DVMCard dvm={dvm} onClick={() => handleDVMSelect(dvm.pubkey)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gradient overlays for scroll indication */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
            </div>

            {/* Language selection and translate button */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleTranslate}
                disabled={!selectedDVM}
                className="w-full sm:w-auto"
              >
                <Languages className="h-4 w-4 mr-2" />
                Request Translation
              </Button>
            </div>

            {selectedDVM && (
              <div className="text-xs text-muted-foreground text-center">
                Translation will be requested from the selected service
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-rtl {
          animation: scroll-rtl 20s linear infinite;
        }
        .animate-scroll-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
