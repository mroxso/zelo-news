import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { BlogLayout } from "./components/BlogLayout";

import BlogHomePage from "./pages/BlogHomePage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import { BookmarksPage } from "./pages/BookmarksPage";
import FollowingPage from "./pages/FollowingPage";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BlogLayout>
        <Routes>
          <Route path="/" element={<BlogHomePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/edit/:identifier" element={<EditPostPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/following" element={<FollowingPage />} />
          {/* NIP-19 route for all Nostr identifiers (npub, nprofile, naddr, note, nevent) */}
          <Route path="/:nip19" element={<NIP19Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BlogLayout>
    </BrowserRouter>
  );
}
export default AppRouter;