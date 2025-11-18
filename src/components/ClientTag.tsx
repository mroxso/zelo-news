import type { NostrEvent } from '@nostrify/nostrify';
import { parseClientTag } from '@/lib/parseClientTag';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';

interface ClientTagProps {
  event: NostrEvent;
}

/**
 * Displays the client tag information from a Nostr event according to NIP-89
 * Shows the client name that was used to publish the event
 */
export function ClientTag({ event }: ClientTagProps) {
  const clientInfo = parseClientTag(event);

  if (!clientInfo) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Smartphone className="h-4 w-4" />
      <span>Published with</span>
      <Badge variant="secondary" className="font-normal">
        {clientInfo.name}
      </Badge>
    </div>
  );
}
