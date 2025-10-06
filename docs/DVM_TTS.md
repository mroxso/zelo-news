# DVM TTS (NIP-90) Implementation

This document describes the implementation of Data Vending Machine (DVM) Text-to-Speech (TTS) functionality for articles using NIP-90.

## Overview

The DVM TTS feature allows users to request and listen to audio versions of articles. The implementation follows NIP-90 for Data Vending Machines, enabling users to:

1. View existing TTS conversions for articles
2. Request new TTS conversions from DVM service providers
3. Choose from multiple TTS versions if available
4. Pay for TTS jobs using Lightning Network

## Architecture

### Hooks

#### `useDVMTTS.ts`

Contains four main hooks for DVM TTS functionality:

##### `useDVMProviders()`
Queries for available DVM service providers that support TTS (kind 5250) using NIP-89 announcements (kind 31990).

Returns:
- Array of DVM providers with metadata (name, about, image, pubkey)

##### `useTTSJobs(articleEvent)`
Queries for completed TTS job results (kind 6250) for a specific article.

Parameters:
- `articleEvent`: The article event (kind 30023) to query TTS results for

Returns:
- Array of TTS job results with audio URLs and metadata

##### `useJobFeedback(jobRequestId)`
Monitors job feedback (kind 7000) for a specific job request to track status updates.

Parameters:
- `jobRequestId`: The event ID of the job request

Returns:
- Array of feedback events sorted by creation time
- Automatically refetches while job is processing

##### `useRequestTTS()`
Mutation hook to request a new TTS job (kind 5250).

Returns:
- `mutate`: Function to request TTS conversion
- `isPending`: Loading state
- `activeJobRequestId`: ID of the active job request
- `clearActiveJob`: Function to clear active job status

### Components

#### `TTSPlayer`
Main component that displays TTS functionality on article pages.

Features:
- Shows existing audio versions with HTML5 audio player
- Displays job status (processing, payment required, error)
- Allows selection between multiple TTS versions
- Provides "Request TTS" button for new conversions
- Handles Lightning payments for jobs

Props:
- `articleEvent`: The article event to display TTS for
- `className`: Optional CSS classes

#### `DVMSelector`
Component for selecting a DVM service provider.

Features:
- Lists available DVM providers from NIP-89
- Displays provider metadata (name, about, avatar)
- Visual indication of selected provider
- Handles provider selection

Props:
- `onSelect`: Callback when provider is selected
- `selectedProvider`: Currently selected provider pubkey
- `className`: Optional CSS classes

#### `DVMSelectorButton`
Convenience component that wraps DVMSelector in a modal dialog.

Features:
- Button to open provider selection dialog
- Modal/dialog UI for provider selection
- Confirm/cancel actions

Props:
- `onConfirm`: Callback when provider is confirmed
- `buttonText`: Custom button text
- `disabled`: Whether button is disabled

## NIP-90 Implementation Details

### Job Request (Kind 5250)

When a user requests TTS conversion:

```json
{
  "kind": 5250,
  "content": "",
  "tags": [
    ["i", "30023:pubkey:identifier", "event"],
    ["param", "language", "en"],
    ["output", "audio/mpeg"],
    ["p", "provider-pubkey"]
  ]
}
```

- `i` tag: References the article event using 'a' tag format for addressable events
- `param` tag: Specifies language (defaults to "en")
- `output` tag: Requests MP3 audio format
- `p` tag: Optional - specifies preferred service provider

### Job Result (Kind 6250)

Service providers publish results:

```json
{
  "kind": 6250,
  "content": "https://example.com/audio.mp3",
  "tags": [
    ["request", "<job-request-json>"],
    ["e", "<job-request-id>"],
    ["a", "30023:pubkey:identifier"],
    ["p", "<customer-pubkey>"],
    ["amount", "10000", "<optional-bolt11>"]
  ]
}
```

- `content`: Audio file URL
- `request` tag: Original job request stringified
- `e` tag: References job request event
- `a` tag: References article
- `amount` tag: Payment amount in millisats and optional Lightning invoice

### Job Feedback (Kind 7000)

Service providers can send status updates:

```json
{
  "kind": 7000,
  "content": "",
  "tags": [
    ["status", "processing", "Converting article to speech..."],
    ["e", "<job-request-id>"],
    ["p", "<customer-pubkey>"]
  ]
}
```

Status values:
- `payment-required`: Payment needed before processing
- `processing`: Job is being processed
- `error`: Job failed
- `success`: Job completed successfully
- `partial`: Partial results available

## Usage

### Basic Integration

Add the TTSPlayer component to article pages:

```tsx
import { TTSPlayer } from '@/components/TTSPlayer';

function ArticlePage({ article }: { article: NostrEvent }) {
  return (
    <article>
      {/* Article content */}
      <div>{article.content}</div>
      
      {/* TTS Player */}
      <TTSPlayer articleEvent={article} className="mt-8" />
    </article>
  );
}
```

### User Flow

1. **Viewing TTS Options**
   - Component automatically queries for existing TTS conversions
   - If available, displays audio player with controls
   - Multiple versions show as selectable options

2. **Requesting TTS**
   - User clicks "Request TTS Conversion" button
   - Modal opens with available DVM providers
   - User selects preferred provider
   - Job request is published to Nostr

3. **Monitoring Progress**
   - Component automatically monitors job feedback
   - Displays status updates (processing, payment required, etc.)
   - User can dismiss status messages

4. **Payment**
   - If payment is required, Lightning invoice is shown
   - User can click to open invoice in Lightning wallet
   - Job continues after payment is received

5. **Listening to Audio**
   - Once job is complete, audio player appears
   - User can play/pause and control playback
   - Can request additional conversions from other providers

## Lightning Payments

The implementation supports Lightning Network payments for TTS jobs:

- Service providers can include `bolt11` invoice in `amount` tag
- Payment button opens Lightning URL (`lightning:invoice`)
- Users can pay with any Lightning wallet
- Jobs may proceed after payment confirmation

## Security Considerations

1. **Event Validation**: TTS results should include valid audio URLs
2. **Provider Trust**: Users choose which DVMs to trust
3. **Payment Safety**: Lightning invoices are opened in external wallets
4. **Content Type**: Audio player only loads URLs from TTS results

## Future Enhancements

Potential improvements:
- Language selection in UI
- Voice/model selection
- Progress percentage for long articles
- Caching TTS results
- Rating/feedback for TTS quality
- Automatic retry on failure
- Download audio files
- Playback speed controls
