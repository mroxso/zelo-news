import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { BlogLayout } from "./components/BlogLayout";

import BlogHomePage from "./pages/BlogHomePage";
import BlogPostPage from "./pages/BlogPostPage";
import CreatePostPage from "./pages/CreatePostPage";
import EditPostPage from "./pages/EditPostPage";
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
          {/* NIP-19 route for naddr1 blog posts */}
          <Route path="/:naddr" element={<BlogPostPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BlogLayout>
    </BrowserRouter>
  );
}
export default AppRouter;