import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDVMProviders } from '@/hooks/useDVMTTS';
import { genUserName } from '@/lib/genUserName';

interface DVMSelectorProps {
  onSelect: (providerPubkey: string) => void;
  selectedProvider?: string | null;
  className?: string;
}

export function DVMSelector({ onSelect, selectedProvider, className }: DVMSelectorProps) {
  const { data: providers, isLoading } = useDVMProviders();
  const [localSelected, setLocalSelected] = useState<string | null>(selectedProvider || null);

  const handleSelect = (pubkey: string) => {
    setLocalSelected(pubkey);
    onSelect(pubkey);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No TTS service providers found. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {providers.map((provider) => {
          const isSelected = localSelected === provider.pubkey;
          const displayName = provider.name || genUserName(provider.pubkey);

          return (
            <Card
              key={provider.pubkey}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelect(provider.pubkey)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={provider.image} alt={displayName} />
                    <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    {provider.about && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {provider.about}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {localSelected && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Selected provider will process your TTS request
        </div>
      )}
    </div>
  );
}

/**
 * Simple selector button that opens a dialog/drawer with DVM options
 */
interface DVMSelectorButtonProps {
  onConfirm: (providerPubkey: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

export function DVMSelectorButton({ onConfirm, buttonText = 'Select TTS Provider', disabled }: DVMSelectorButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedProvider) {
      onConfirm(selectedProvider);
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={disabled}>
        {buttonText}
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Select TTS Service Provider</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a Data Vending Machine to convert this article to speech
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <DVMSelector
                onSelect={setSelectedProvider}
                selectedProvider={selectedProvider}
              />
            </div>
            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedProvider}
                className="flex-1"
              >
                Confirm Selection
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
