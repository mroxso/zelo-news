import { Check, ChevronsUpDown, Wifi, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMemo, useState } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserRelays } from "@/hooks/useUserRelays";

interface RelaySelectorProps {
  className?: string;
}

export function RelaySelector(props: RelaySelectorProps) {
  const { className } = props;
  const { config, updateConfig, presetRelays = [] } = useAppContext();
  const { user } = useCurrentUser();
  const { data: userRelays = [] } = useUserRelays(user?.pubkey);
  
  const selectedRelay = config.relayUrl;
  const setSelectedRelay = (relay: string) => {
    updateConfig((current) => ({ ...current, relayUrl: relay }));
  };

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selectedOption = presetRelays.find((option) => option.url === selectedRelay);

  // Build combined relay options: preset relays + user's NIP-65 relays (deduped)
  const combinedRelays = useMemo(() => {
    // Normalize helper to ensure matching with selected values
    const normalize = (url: string) => url.replace(/^wss?:\/\//, "");

    const preset = presetRelays.map((r) => ({ ...r, source: "preset" as const }));

    // Convert user relay URLs into the same shape with a default name
    const fromUser = userRelays
      .filter(Boolean)
      .map((url) => ({
        name: normalize(url),
        url,
        source: "user" as const,
      }));

    // Deduplicate by URL
    const map = new Map<string, { name: string; url: string; source: "preset" | "user" }>();
    for (const r of [...preset, ...fromUser]) {
      if (!map.has(r.url)) map.set(r.url, r);
    }

    const all = Array.from(map.values());
    const userOnly = all.filter((r) => r.source === "user" && !presetRelays.some((p) => p.url === r.url));
    const presetOnly = all.filter((r) => r.source === "preset");
    return { all, userOnly, presetOnly };
  }, [presetRelays, userRelays]);

  // Function to normalize relay URL by adding wss:// if no protocol is present
  const normalizeRelayUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    
    // Check if it already has a protocol
    if (trimmed.includes('://')) {
      return trimmed;
    }
    
    // Add wss:// prefix
    return `wss://${trimmed}`;
  };

  // Handle adding a custom relay
  const handleAddCustomRelay = (url: string) => {
    setSelectedRelay?.(normalizeRelayUrl(url));
    setOpen(false);
    setInputValue("");
  };

  // Check if input value looks like a valid relay URL
  const isValidRelayInput = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // Basic validation - should contain at least a domain-like structure
    const normalized = normalizeRelayUrl(trimmed);
    try {
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span className="truncate">
              {selectedOption 
                ? selectedOption.name 
                : selectedRelay 
                  ? selectedRelay.replace(/^wss?:\/\//, '')
                  : "Select relay..."
              }
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search relays or type URL..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {inputValue && isValidRelayInput(inputValue) ? (
                <CommandItem
                  onSelect={() => handleAddCustomRelay(inputValue)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">Add custom relay</span>
                    <span className="text-xs text-muted-foreground">
                      {normalizeRelayUrl(inputValue)}
                    </span>
                  </div>
                </CommandItem>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {inputValue ? "Invalid relay URL" : "No relay found."}
                </div>
              )}
            </CommandEmpty>
            {/* User relays group (from NIP-65) */}
            {combinedRelays.userOnly.length > 0 && (
              <CommandGroup heading="Your relays">
                {combinedRelays.userOnly
                  .filter((option) =>
                    !inputValue ||
                    option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                    option.url.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .map((option) => (
                    <CommandItem
                      key={option.url}
                      value={option.url}
                      onSelect={(currentValue) => {
                        setSelectedRelay(normalizeRelayUrl(currentValue));
                        setOpen(false);
                        setInputValue("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRelay === option.url ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-xs text-muted-foreground">{option.url}</span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {/* Preset relays group */}
            <CommandGroup heading="Preset relays">
              {combinedRelays.presetOnly
                .filter((option) =>
                  !inputValue ||
                  option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.url.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((option) => (
                  <CommandItem
                    key={option.url}
                    value={option.url}
                    onSelect={(currentValue) => {
                      setSelectedRelay(normalizeRelayUrl(currentValue));
                      setOpen(false);
                      setInputValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedRelay === option.url ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{option.name}</span>
                      <span className="text-xs text-muted-foreground">{option.url}</span>
                    </div>
                  </CommandItem>
                ))}

              {inputValue && isValidRelayInput(inputValue) && (
                <CommandItem
                  onSelect={() => handleAddCustomRelay(inputValue)}
                  className="cursor-pointer border-t"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">Add custom relay</span>
                    <span className="text-xs text-muted-foreground">
                      {normalizeRelayUrl(inputValue)}
                    </span>
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}