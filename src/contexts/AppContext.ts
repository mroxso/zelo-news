import { createContext } from "react";
import type { InterestSetData } from "@/lib/interestSets";

export type Theme = "dark" | "light" | "system";

export interface RelayMetadata {
  /** List of relays with read/write permissions */
  relays: { url: string; read: boolean; write: boolean }[];
  /** Unix timestamp of when the relay list was last updated */
  updatedAt: number;
}

export interface InterestSetsMetadata {
  /** User-defined interest sets mapping identifier to full metadata */
  sets: Record<string, InterestSetData>;
  /** Unix timestamp of when the interest sets were last updated */
  updatedAt: number;
}

export interface AppConfig {
  /** Current theme */
  theme: Theme;
  /** NIP-65 relay list metadata */
  relayMetadata: RelayMetadata;
  /** Hide latest articles section on home page */
  hideLatestArticles?: boolean;
  /** Interest sets metadata with timestamp tracking */
  interestSetsMetadata: InterestSetsMetadata;
}

export interface AppContextType {
  /** Current application configuration */
  config: AppConfig;
  /** Update configuration using a callback that receives current config and returns new config */
  updateConfig: (updater: (currentConfig: Partial<AppConfig>) => Partial<AppConfig>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
