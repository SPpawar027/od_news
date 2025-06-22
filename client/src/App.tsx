import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArticlePage from "@/pages/article";
import CategoryPage from "@/pages/category";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminArticles from "@/pages/admin/articles";
import AdminVideos from "@/pages/admin/videos";
import AdminBreakingNews from "@/pages/admin/breaking-news";
import AdminLiveTv from "@/pages/admin/live-tv";
import AdminRssFeeds from "@/pages/admin/rss-feeds";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/breaking-news" component={AdminBreakingNews} />
      <Route path="/admin/live-tv" component={AdminLiveTv} />
      <Route path="/admin/rss-feeds" component={AdminRssFeeds} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
