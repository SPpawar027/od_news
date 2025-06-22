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
import SearchPage from "@/pages/search";
import AccountPage from "@/pages/account";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/live-tv" component={LiveTVPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/account" component={AccountPage} />
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
