# Zelo.news

**A Decentralized Blogging Platform Built on Nostr**

Zelo.news is a modern, censorship-resistant blogging platform powered by the Nostr protocol. Write, publish, and share long-form content without intermediaries or platform restrictions. Your content lives on a decentralized network, giving you true ownership and freedom of expression.

## ✨ Features

- **📝 Long-form Publishing**: Write and publish articles using NIP-23 (long-form content)
- **💬 Comments & Engagement**: Built-in comment system with threaded discussions
- **⚡ Lightning Zaps**: Support your favorite writers with instant Bitcoin payments
- **🔐 Censorship-Resistant**: Content stored across multiple Nostr relays
- **🎨 Beautiful Design**: Clean, distraction-free reading experience with light/dark themes
- **👤 User Profiles**: Follow writers and build your audience
- **🌐 Multi-Relay Support**: Connect to any Nostr relay for maximum reach
- **📱 Responsive**: Optimized for all devices - desktop, tablet, and mobile

## � Quick Start

```bash
# Clone the repository
git clone https://github.com/mroxso/zelo-news.git
cd zelo-news

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠 Technology Stack

- **React 18.x**: Modern React with hooks and concurrent rendering
- **TypeScript**: Full type safety for robust code
- **TailwindCSS 3.x**: Utility-first styling with custom design system
- **Vite**: Lightning-fast build tool and development server
- **Nostrify**: Comprehensive Nostr protocol implementation
- **shadcn/ui**: Beautiful, accessible UI components
- **TanStack Query**: Powerful data fetching and caching
- **React Router**: Seamless client-side navigation
- **Markdown Support**: Full markdown rendering for articles

## 📖 How It Works

Zelo.news leverages the Nostr protocol to create a truly decentralized blogging platform:

1. **Content Publishing**: Articles are published as NIP-23 events (long-form content)
2. **Distributed Storage**: Content is stored across multiple Nostr relays
3. **User Identity**: Writers and readers use Nostr key pairs (npub/nsec)
4. **Comments**: NIP-10 threaded comments enable discussions
5. **Monetization**: NIP-57 Lightning zaps allow instant micropayments
6. **No Central Server**: No single point of failure or censorship

## � Key Features for Writers

### Publishing Tools
- **Rich Text Editor**: Write with markdown support for formatting
- **Draft Management**: Save and edit posts before publishing
- **Media Uploads**: Add images and media via Blossom servers (NIP-94)
- **SEO Friendly**: Articles include metadata for better discoverability
- **Version History**: All edits preserved on the Nostr network

### Monetization
- **Lightning Zaps**: Receive instant Bitcoin tips from readers
- **Wallet Connect**: Support for WebLN and NWC (NIP-47)
- **Transparent**: No platform fees or middlemen

### Audience Building
- **Profile Pages**: Showcase your published articles
- **User Profiles**: Display name, bio, avatar, and social links
- **Engagement Metrics**: See comments and zaps on your content
- **Multi-Account**: Manage multiple writer identities

## 🔑 Key Features for Readers

### Discovery & Reading
- **Clean Interface**: Distraction-free reading experience
- **Infinite Scroll**: Seamless browsing through articles
- **Search & Filter**: Find content by author, topic, or relay
- **Responsive Design**: Perfect reading on any device

### Engagement
- **Comments**: Participate in threaded discussions (NIP-10)
- **Zap Authors**: Support writers with Lightning payments
- **Save & Share**: Bookmark articles and share via Nostr identifiers
- **Follow Authors**: Keep track of your favorite writers

### Privacy & Control
- **No Tracking**: No analytics or data collection
- **Relay Choice**: Choose which relays to read from
- **Key Management**: Use browser extensions or your own keys
- **True Ownership**: Your identity and data belong to you

## 🌐 Nostr Protocol Integration

Zelo.news implements several Nostr Improvement Proposals (NIPs):

- **NIP-01**: Basic protocol flow and event structure
- **NIP-07**: Browser extension signing (Alby, nos2x, etc.)
- **NIP-10**: Threaded comment system
- **NIP-19**: Identifier routing (npub, note, naddr, nevent)
- **NIP-23**: Long-form content (blog posts)
- **NIP-25**: Reactions and likes
- **NIP-44**: Encrypted messaging
- **NIP-57**: Lightning zaps and monetization
- **NIP-94**: File metadata and uploads

## 🔐 Privacy & Security

- **Self-Sovereign Identity**: You control your keys, you control your content
- **No Account Creation**: Use existing Nostr keys or browser extensions
- **Encrypted Options**: Support for private content via NIP-44
- **Open Source**: Fully transparent codebase for security audits
- **Multi-Relay**: Content distributed across multiple relays for redundancy

## 📁 Project Structure

```
src/
├── components/          
│   ├── ui/              # 48+ shadcn/ui components
│   ├── auth/            # Login and account management
│   ├── comments/        # Comment system
│   ├── BlogHeader.tsx   # Site header with navigation
│   ├── BlogPostForm.tsx # Article editor
│   └── MarkdownContent.tsx # Markdown renderer
├── hooks/               
│   ├── useNostr.ts      # Nostr protocol integration
│   ├── useBlogPosts.ts  # Fetch articles
│   ├── useAuthor.ts     # User profile data
│   ├── useComments.ts   # Comment functionality
│   └── useZaps.ts       # Lightning payments
├── pages/               
│   ├── BlogHomePage.tsx # Homepage with article feed
│   ├── ArticlePage.tsx # Individual article view
│   ├── CreatePostPage.tsx # Article editor
│   └── EditPostPage.tsx # Edit existing articles
├── contexts/            # React context providers
└── lib/                 # Utility functions
```

## 💻 Development

### Prerequisites

- Node.js 18+ and npm
- A Nostr browser extension for testing (optional but recommended)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file for custom configuration:

```env
# Optional: Default relay URL
VITE_DEFAULT_RELAY=wss://relay.nostr.band

# Optional: App name
VITE_APP_NAME=zelo.news
```

## 🚀 Deployment

### Deploy to Netlify/Vercel

```bash
# Build the project
npm run build

# The dist/ folder contains your static site
```

### Deploy to NostrDeploy

```bash
npm run deploy
```

The app is a static site and can be hosted anywhere that supports single-page applications.

## 🤝 Contributing

Zelo.news is open source and welcomes contributions! Whether you're fixing bugs, adding features, or improving documentation, we'd love your help.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Run tests**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Write TypeScript with proper types (no `any`)
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Test on multiple relays

## 📚 Resources

- **Nostr Protocol**: [nostr.com](https://nostr.com)
- **NIPs Repository**: [github.com/nostr-protocol/nips](https://github.com/nostr-protocol/nips)
- **NIP-23 Long-form Content**: [github.com/nostr-protocol/nips/blob/master/23.md](https://github.com/nostr-protocol/nips/blob/master/23.md)
- **shadcn/ui Components**: [ui.shadcn.com](https://ui.shadcn.com)
- **React Documentation**: [react.dev](https://react.dev)

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? Open an issue on GitHub!

- **Bug Reports**: Include steps to reproduce, expected behavior, and actual behavior
- **Feature Requests**: Describe the feature and why it would be useful
- **Questions**: Join the Nostr community or open a discussion

## 🌟 Acknowledgments

Built with:
- [MKStack](https://soapbox.pub/mkstack) - Nostr development framework
- [Nostrify](https://nostrify.dev) - Nostr protocol implementation
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- The entire Nostr community

## 💬 Connect

- **GitHub**: [github.com/mroxso/zelo-news](https://github.com/mroxso/zelo-news)

---

**Made with ⚡ and 💜 for the decentralized web**

*Write freely. Publish independently. Own your content forever.*