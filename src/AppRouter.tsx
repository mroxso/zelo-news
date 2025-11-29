import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { Layout } from "./components/Layout";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import FollowingPage from "./pages/FollowingPage";
import HighlightsPage from "./pages/HighlightsPage";
import Nip05ProfilePage from "./pages/Nip05ProfilePage";
import ArticleByDTagPage from "./pages/ArticleByDTagPage";
import { NIP19Page } from "./pages/NIP19Page";
import SettingsPage from "./pages/SettingsPage";
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/edit/:identifier" element={<EditPostPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/highlights" element={<HighlightsPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* NIP-05 profile route (e.g., /p/alice@example.com) */}
          <Route path="/p/:nip05" element={<Nip05ProfilePage />} />
          {/* Article by d-tag route (e.g., /article/my-article-slug) */}
          <Route path="/article/:dtag" element={<ArticleByDTagPage />} />
          {/* Tag browsing route (e.g., /tag/bitcoin) */}
          <Route path="/tag/:tag" element={<TagPage />} />
          {/* NIP-19 route for all Nostr identifiers (npub, nprofile, naddr, note, nevent) */}
          <Route path="/:nip19" element={<NIP19Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default AppRouter;