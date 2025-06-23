import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ArticlePage from "@/pages/article";
import CategoryPage from "@/pages/category";
import LiveTVPage from "@/pages/live-tv";
import VideosPage from "@/pages/videos";
import RSSNewsPage from "@/pages/rss-news";
import SearchPage from "@/pages/search";
import AccountPage from "@/pages/account";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminArticlesPage from "@/pages/admin-articles";
import AdminLiveTVPage from "@/pages/admin-live-tv";
import AdminVideosPage from "@/pages/admin-videos";
import AdminRSSPage from "@/pages/admin-rss";
import AdminUsersPage from "@/pages/admin-users";
import AdminForgotPasswordPage from "@/pages/admin-forgot-password";
import AdminAdsPage from "@/pages/admin-ads";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/live-tv" component={LiveTVPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/rss-news/:category?" component={RSSNewsPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/forgot-password" component={AdminForgotPasswordPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/articles" component={AdminArticlesPage} />
      <Route path="/admin/live-tv" component={AdminLiveTVPage} />
      <Route path="/admin/videos" component={AdminVideosPage} />
      <Route path="/admin/rss" component={AdminRSSPage} />

      <Route path="/admin/ads" component={AdminAdsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/*" component={AdminDashboard} />
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
