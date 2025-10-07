import { nip19 } from 'nostr-tools';
import { useParams } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import ArticlePage from './ArticlePage';
import { NotePage } from './NotePage';
import { EventPage } from './EventPage';
import NotFound from './NotFound';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type, data } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      // Render profile page - ProfilePage will handle validation
      return <ProfilePage />;

    case 'note':
      // Render kind:1 text note
      return <NotePage eventId={data as string} />;

    case 'nevent': {
      // Render any event with optional relay hints and author
      const eventData = data as { id: string; relays?: string[]; author?: string; kind?: number };
      return (
        <EventPage 
          eventId={eventData.id}
          relayHints={eventData.relays}
          authorPubkey={eventData.author}
          kind={eventData.kind}
        />
      );
    }

    case 'naddr':
      // Render addressable event (blog post) - ArticlePage will handle validation
      return <ArticlePage />;

    default:
      return <NotFound />;
  }
} 