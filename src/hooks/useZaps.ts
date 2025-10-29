import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useAppContext } from '@/hooks/useAppContext';
import { useToast } from '@/hooks/useToast';
import { useNWC } from '@/hooks/useNWCContext';
import type { NWCConnection } from '@/hooks/useNWC';
import { nip57 } from 'nostr-tools';
import type { Event } from 'nostr-tools';
import type { WebLNProvider } from 'webln';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

export function useZaps(
  target: Event | Event[],
  webln: WebLNProvider | null,
  _nwcConnection: NWCConnection | null,
  onZapSuccess?: () => void
) {
  const { nostr } = useNostr();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const queryClient = useQueryClient();

  // Handle the case where an empty array is passed (from ZapButton when external data is provided)
  const actualTarget = Array.isArray(target) ? (target.length > 0 ? target[0] : null) : target;

  const author = useAuthor(actualTarget?.pubkey);
  const { sendPayment, getActiveConnection } = useNWC();
  const [isZapping, setIsZapping] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  // Split zap support
  type SplitInvoice = {
    recipient: string; // hex pubkey
    weight: number; // 1..100
    relays: string[];
    amount: number; // sats
    zapEndpoint?: string;
    zapRequest?: unknown;
    invoice?: string;
    isPaying?: boolean;
    paid?: boolean;
    error?: string;
  };
  const [splitInvoices, setSplitInvoices] = useState<SplitInvoice[]>([]);

  // Cleanup state when component unmounts
  useEffect(() => {
    return () => {
      setIsZapping(false);
      setInvoice(null);
      setSplitInvoices([]);
    };
  }, []);

  const { data: zapEvents, ...query } = useQuery<NostrEvent[], Error>({
    queryKey: ['zaps', actualTarget?.id],
    staleTime: 30000, // 30 seconds
    refetchInterval: (query) => {
      // Only refetch if the query is currently being observed (component is mounted)
      return query.getObserversCount() > 0 ? 60000 : false;
    },
    queryFn: async (c) => {
      if (!actualTarget) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for zap receipts for this specific event
      if (actualTarget.kind >= 30000 && actualTarget.kind < 40000) {
        // Addressable event
        const identifier = actualTarget.tags.find((t) => t[0] === 'd')?.[1] || '';
        const events = await nostr.query([{
          kinds: [9735],
          '#a': [`${actualTarget.kind}:${actualTarget.pubkey}:${identifier}`],
        }], { signal });
        return events;
      } else {
        // Regular event
        const events = await nostr.query([{
          kinds: [9735],
          '#e': [actualTarget.id],
        }], { signal });
        return events;
      }
    },
    enabled: !!actualTarget?.id,
  });

  // Process zap events into simple counts and totals
  const { zapCount, totalSats, zaps } = useMemo(() => {
    if (!zapEvents || !Array.isArray(zapEvents) || !actualTarget) {
      return { zapCount: 0, totalSats: 0, zaps: [] };
    }

    let count = 0;
    let sats = 0;

    zapEvents.forEach(zap => {
      count++;

      // Try multiple methods to extract the amount:

      // Method 1: amount tag (from zap request, sometimes copied to receipt)
      const amountTag = zap.tags.find(([name]) => name === 'amount')?.[1];
      if (amountTag) {
        const millisats = parseInt(amountTag);
        sats += Math.floor(millisats / 1000);
        return;
      }

      // Method 2: Extract from bolt11 invoice
      const bolt11Tag = zap.tags.find(([name]) => name === 'bolt11')?.[1];
      if (bolt11Tag) {
        try {
          const invoiceSats = nip57.getSatoshisAmountFromBolt11(bolt11Tag);
          sats += invoiceSats;
          return;
        } catch (error) {
          console.warn('Failed to parse bolt11 amount:', error);
        }
      }

      // Method 3: Parse from description (zap request JSON)
      const descriptionTag = zap.tags.find(([name]) => name === 'description')?.[1];
      if (descriptionTag) {
        try {
          const zapRequest = JSON.parse(descriptionTag);
          const requestAmountTag = zapRequest.tags?.find(([name]: string[]) => name === 'amount')?.[1];
          if (requestAmountTag) {
            const millisats = parseInt(requestAmountTag);
            sats += Math.floor(millisats / 1000);
            return;
          }
        } catch (error) {
          console.warn('Failed to parse description JSON:', error);
        }
      }

      console.warn('Could not extract amount from zap receipt:', zap.id);
    });


    return { zapCount: count, totalSats: sats, zaps: zapEvents };
  }, [zapEvents, actualTarget]);

  const zap = async (amount: number, comment: string) => {
    if (amount <= 0) {
      return;
    }

    setIsZapping(true);
    setInvoice(null); // Clear any previous invoice at the start

    if (!user) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to send a zap.',
        variant: 'destructive',
      });
      setIsZapping(false);
      return;
    }

    if (!actualTarget) {
      toast({
        title: 'Event not found',
        description: 'Could not find the event to zap.',
        variant: 'destructive',
      });
      setIsZapping(false);
      return;
    }

    try {
      if (!author.data || !author.data?.metadata || !author.data?.event ) {
        toast({
          title: 'Author not found',
          description: 'Could not find the author of this item.',
          variant: 'destructive',
        });
        setIsZapping(false);
        return;
      }

      const { lud06, lud16 } = author.data.metadata;
      if (!lud06 && !lud16) {
        toast({
          title: 'Lightning address not found',
          description: 'The author does not have a lightning address configured.',
          variant: 'destructive',
        });
        setIsZapping(false);
        return;
      }

      // Get zap endpoint using the old reliable method
      const zapEndpoint = await nip57.getZapEndpoint(author.data.event);
      if (!zapEndpoint) {
        toast({
          title: 'Zap endpoint not found',
          description: 'Could not find a zap endpoint for the author.',
          variant: 'destructive',
        });
        setIsZapping(false);
        return;
      }

      // Create zap request - use appropriate event format based on kind
      // For addressable events (30000-39999), pass the object to get 'a' tag
      // For all other events, pass the ID string to get 'e' tag
      const event = (actualTarget.kind >= 30000 && actualTarget.kind < 40000)
        ? actualTarget
        : actualTarget.id;

      const zapAmount = amount * 1000; // convert to millisats

      const zapRequest = nip57.makeZapRequest({
        profile: actualTarget.pubkey,
        event: event,
        amount: zapAmount,
        relays: [config.relayUrl],
        comment
      });

      // If target event contains zap split tags, include them in the zap request,
      // so compatible zap servers can honor the split distribution.
      try {
        if (Array.isArray(actualTarget.tags)) {
          const splitTags = actualTarget.tags.filter((t) => t[0] === 'zap');
          if (splitTags.length > 0) {
            const zr = zapRequest as unknown as { tags?: string[][] };
            zr.tags = Array.isArray(zr.tags) ? zr.tags : [];
            zr.tags.push(...splitTags);
          }
        }
      } catch (e) {
        console.debug('Failed to include zap split tags in zap request', e);
      }

      // Sign the zap request (but don't publish to relays - only send to LNURL endpoint)
      if (!user.signer) {
        throw new Error('No signer available');
      }
      const signedZapRequest = await user.signer.signEvent(zapRequest);

      try {
        const res = await fetch(`${zapEndpoint}?amount=${zapAmount}&nostr=${encodeURI(JSON.stringify(signedZapRequest))}`);
            const responseData = await res.json();

            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${responseData.reason || 'Unknown error'}`);
            }

            const newInvoice = responseData.pr;
            if (!newInvoice || typeof newInvoice !== 'string') {
              throw new Error('Lightning service did not return a valid invoice');
            }

            // Get the current active NWC connection dynamically
            const currentNWCConnection = getActiveConnection();

            // Try NWC first if available and properly connected
            if (currentNWCConnection && currentNWCConnection.connectionString && currentNWCConnection.isConnected) {
              try {
                await sendPayment(currentNWCConnection, newInvoice);

                // Clear states immediately on success
                setIsZapping(false);
                setInvoice(null);

                toast({
                  title: 'Zap successful!',
                  description: `You sent ${amount} sats via NWC to the author.`,
                });

                // Invalidate zap queries to refresh counts
                queryClient.invalidateQueries({ queryKey: ['zaps'] });

                // Close dialog last to ensure clean state
                onZapSuccess?.();
                return;
              } catch (nwcError) {
                console.error('NWC payment failed, falling back:', nwcError);

                // Show specific NWC error to user for debugging
                const errorMessage = nwcError instanceof Error ? nwcError.message : 'Unknown NWC error';
                toast({
                  title: 'NWC payment failed',
                  description: `${errorMessage}. Falling back to other payment methods...`,
                  variant: 'destructive',
                });
              }
            }
            
            if (webln) {  // Try WebLN next
              try {
                await webln.sendPayment(newInvoice);

                // Clear states immediately on success
                setIsZapping(false);
                setInvoice(null);

                toast({
                  title: 'Zap successful!',
                  description: `You sent ${amount} sats to the author.`,
                });

                // Invalidate zap queries to refresh counts
                queryClient.invalidateQueries({ queryKey: ['zaps'] });

                // Close dialog last to ensure clean state
                onZapSuccess?.();
              } catch (weblnError) {
                console.error('webln payment failed, falling back:', weblnError);

                // Show specific WebLN error to user for debugging
                const errorMessage = weblnError instanceof Error ? weblnError.message : 'Unknown WebLN error';
                toast({
                  title: 'WebLN payment failed',
                  description: `${errorMessage}. Falling back to other payment methods...`,
                  variant: 'destructive',
                });

                setInvoice(newInvoice);
                setIsZapping(false);
              }
            } else { // Default - show QR code and manual Lightning URI
              setInvoice(newInvoice);
              setIsZapping(false);
            }
          } catch (err) {
            console.error('Zap error:', err);
            toast({
              title: 'Zap failed',
              description: (err as Error).message,
              variant: 'destructive',
            });
            setIsZapping(false);
          }
    } catch (err) {
      console.error('Zap error:', err);
      toast({
        title: 'Zap failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
      setIsZapping(false);
    }
  };

  // Detect zap splits on the target event
  const splitTags = useMemo(() => {
    if (!actualTarget?.tags) return [] as string[][];
    return actualTarget.tags.filter((t) => t[0] === 'zap');
  }, [actualTarget]);
  const hasSplits = splitTags.length > 1; // only treat as split flow when >1 recipients

  // Helper: resolve zap endpoint for a recipient pubkey by fetching their kind 0
  const resolveZapEndpoint = useCallback(async (pubkey: string, signal: AbortSignal): Promise<string | null> => {
    try {
      const events = await nostr.query([
        { kinds: [0], authors: [pubkey], limit: 1 },
      ], { signal });
      const profile = events?.[0];
      if (!profile) return null;
      const endpoint = await nip57.getZapEndpoint(profile as unknown as Event);
      return endpoint ?? null;
    } catch {
      // ignore network errors
      return null;
    }
  }, [nostr]);

  // Prepare split zap invoices (does not auto-pay). Only used when hasSplits === true
  const prepareSplitZaps = useCallback(async (amount: number, comment: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'You must be logged in to send a zap.', variant: 'destructive' });
      return;
    }
    if (!actualTarget) {
      toast({ title: 'Event not found', description: 'Could not find the event to zap.', variant: 'destructive' });
      return;
    }

    // Parse recipients
    const recipients = splitTags.map((t) => {
      // t: ["zap", <hexpub>, "weight", "<n>", "relays", <relay1>...]
      const recipient = t[1] || '';
      const weightIdx = t.findIndex((x) => x === 'weight');
      const weight = weightIdx >= 0 ? Math.max(0, Math.min(100, parseInt(t[weightIdx + 1] || '0', 10) || 0)) : 0;
      const relaysIdx = t.findIndex((x) => x === 'relays');
      const relays = relaysIdx >= 0 ? t.slice(relaysIdx + 1) : [];
      return { recipient, weight, relays };
    }).filter(r => r.recipient);

    const totalWeight = recipients.reduce((acc, r) => acc + r.weight, 0);
    if (recipients.length <= 1 || totalWeight <= 0) {
      // Fallback to single zap flow
      await zap(amount, comment);
      return;
    }

    // Compute per-recipient sats, distribute remainder to the largest weight
    const sats = Math.max(1, Math.trunc(amount));
    const computed: SplitInvoice[] = recipients.map(r => ({ ...r, amount: 0, relays: r.relays, weight: r.weight } as SplitInvoice));
    let assigned = 0;
    let maxIdx = 0;
    let maxWeight = -1;
    computed.forEach((r, i) => {
      const share = Math.floor((sats * r.weight) / totalWeight);
      r.amount = share;
      assigned += share;
      if (r.weight > maxWeight) { maxWeight = r.weight; maxIdx = i; }
    });
    const remainder = sats - assigned;
    if (remainder > 0) {
      computed[maxIdx].amount += remainder;
    }

    setIsZapping(true);
    setSplitInvoices([]);

    const signal = AbortSignal.timeout(10000);
    try {
      // Prepare zap requests and fetch invoices for each recipient in parallel
      const results = await Promise.all(computed.map(async (item) => {
        const endpoint = await resolveZapEndpoint(item.recipient, signal);
        if (!endpoint) {
          return { ...item, error: 'Zap endpoint not found' } as SplitInvoice;
        }

        // Build zap request; use same event reference logic as single flow
        const eventRef = (actualTarget.kind >= 30000 && actualTarget.kind < 40000)
          ? actualTarget
          : actualTarget.id;

        const zapAmountMsat = item.amount * 1000;
        const zr = nip57.makeZapRequest({
          profile: item.recipient,
          event: eventRef,
          amount: zapAmountMsat,
          relays: [config.relayUrl],
          comment,
        });

        // Ensure original split tags are included so servers that support server-side split can verify context
        try {
          if (Array.isArray(actualTarget.tags)) {
            const splitTagsLocal = actualTarget.tags.filter((t) => t[0] === 'zap');
            const zrobj = zr as unknown as { tags?: string[][] };
            zrobj.tags = Array.isArray(zrobj.tags) ? zrobj.tags : [];
            zrobj.tags.push(...splitTagsLocal);
          }
        } catch {
          // ignore tag merge errors
        }

        if (!user.signer) {
          return { ...item, error: 'No signer available' } as SplitInvoice;
        }
        const signed = await user.signer.signEvent(zr);

        try {
          const res = await fetch(`${endpoint}?amount=${zapAmountMsat}&nostr=${encodeURI(JSON.stringify(signed))}`);
          const json = await res.json();
          if (!res.ok) {
            const reason = json?.reason || 'Unknown error';
            return { ...item, zapEndpoint: endpoint, zapRequest: signed, error: `HTTP ${res.status}: ${reason}` } as SplitInvoice;
          }
          const pr = json?.pr as string | undefined;
          if (!pr) {
            return { ...item, zapEndpoint: endpoint, zapRequest: signed, error: 'Lightning service did not return a valid invoice' } as SplitInvoice;
          }
          return { ...item, zapEndpoint: endpoint, zapRequest: signed, invoice: pr } as SplitInvoice;
        } catch (e) {
          return { ...item, zapEndpoint: endpoint, zapRequest: signed, error: (e as Error).message } as SplitInvoice;
        }
      }));

      setSplitInvoices(results);
    } finally {
      setIsZapping(false);
    }
  }, [user, actualTarget, splitTags, config.relayUrl, resolveZapEndpoint, toast, zap]);

  const paySplitInvoice = useCallback(async (idx: number) => {
    const item = splitInvoices[idx];
    if (!item || !item.invoice) {
      toast({ title: 'Payment error', description: 'No invoice available for this split', variant: 'destructive' });
      return;
    }
    // Get current active connection fresh
    const currentNWCConnection = getActiveConnection();
    const inv = item.invoice;
    // Optimistic UI: set isPaying
    setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: true, error: undefined } : it));
    try {
      if (currentNWCConnection && currentNWCConnection.connectionString && currentNWCConnection.isConnected) {
        try {
          await sendPayment(currentNWCConnection, inv);
          setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: false, paid: true } : it));
          toast({ title: 'Zap successful!', description: `You sent ${item.amount} sats via NWC.` });
          queryClient.invalidateQueries({ queryKey: ['zaps'] });
          return;
        } catch (nwcError) {
          const msg = nwcError instanceof Error ? nwcError.message : 'Unknown NWC error';
          toast({ title: 'NWC payment failed', description: msg, variant: 'destructive' });
        }
      }

      if (webln) {
        try {
          await webln.sendPayment(inv);
          setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: false, paid: true } : it));
          toast({ title: 'Zap successful!', description: `You sent ${item.amount} sats.` });
          queryClient.invalidateQueries({ queryKey: ['zaps'] });
          return;
        } catch (weblnError) {
          const msg = weblnError instanceof Error ? weblnError.message : 'Unknown WebLN error';
          setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: false, error: msg } : it));
          toast({ title: 'WebLN payment failed', description: msg, variant: 'destructive' });
          return;
        }
      }

      // Fallback: no automatic method; just show error encouraging copy/open
      setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: false, error: 'No wallet connected. Use Copy or Open.' } : it));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment failed';
      setSplitInvoices((prev) => prev.map((it, i) => i === idx ? { ...it, isPaying: false, error: msg } : it));
      toast({ title: 'Payment failed', description: msg, variant: 'destructive' });
    }
  }, [splitInvoices, toast, queryClient, webln, getActiveConnection, sendPayment]);

  const clearSplitInvoices = useCallback(() => setSplitInvoices([]), []);

  const resetInvoice = useCallback(() => {
    setInvoice(null);
  }, []);

  return {
    zaps,
    zapCount,
    totalSats,
    ...query,
    zap,
    hasSplits,
    prepareSplitZaps,
    splitInvoices,
    paySplitInvoice,
    clearSplitInvoices,
    isZapping,
    invoice,
    setInvoice,
    resetInvoice,
  };
}
