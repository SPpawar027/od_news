import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Edit, Trash2, Rss, RefreshCw, Globe } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface RssFeed {
  id: number;
  name: string;
  nameHindi: string;
  feedUrl: string;
  description: string | null;
  descriptionHindi: string | null;
  lastFetched: Date | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

const rssFeedSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameHindi: z.string().min(1, "Hindi name is required"),
  feedUrl: z.string().url("Valid RSS feed URL is required"),
  description: z.string().optional(),
  descriptionHindi: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RssFeedFormData = z.infer<typeof rssFeedSchema>;

export default function AdminRssFeeds() {
  const { user, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<RssFeedFormData>({
    resolver: zodResolver(rssFeedSchema),
    defaultValues: {
      name: "",
      nameHindi: "",
      feedUrl: "",
      description: "",
      descriptionHindi: "",
      isActive: true,
    },
  });

  const { data: feeds = [], isLoading: feedsLoading } = useQuery({
    queryKey: ["/api/admin/rss-feeds"],
    enabled: isAuthenticated,
  });

  const createFeedMutation = useMutation({
    mutationFn: async (data: RssFeedFormData) => {
      const response = await fetch("/api/admin/rss-feeds", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-feeds"] });
      toast({ title: "Success", description: "RSS feed created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create RSS feed", variant: "destructive" });
    },
  });

  const updateFeedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RssFeedFormData }) => {
      const response = await fetch(`/api/admin/rss-feeds/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-feeds"] });
      toast({ title: "Success", description: "RSS feed updated successfully" });
      setIsDialogOpen(false);
      setEditingFeed(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update RSS feed", variant: "destructive" });
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/rss-feeds/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-feeds"] });
      toast({ title: "Success", description: "RSS feed deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete RSS feed", variant: "destructive" });
    },
  });

  const refreshFeedMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/rss-feeds/${id}/refresh`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to refresh RSS feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-feeds"] });
      toast({ title: "Success", description: "RSS feed refreshed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to refresh RSS feed", variant: "destructive" });
    },
  });

  const handleCreateFeed = (data: RssFeedFormData) => {
    createFeedMutation.mutate(data);
  };

  const handleUpdateFeed = (data: RssFeedFormData) => {
    if (editingFeed) {
      updateFeedMutation.mutate({ id: editingFeed.id, data });
    }
  };

  const handleEditFeed = (feed: RssFeed) => {
    setEditingFeed(feed);
    form.reset({
      name: feed.name,
      nameHindi: feed.nameHindi,
      feedUrl: feed.feedUrl,
      description: feed.description || "",
      descriptionHindi: feed.descriptionHindi || "",
      isActive: feed.isActive || true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFeed = (id: number) => {
    if (confirm("Are you sure you want to delete this RSS feed?")) {
      deleteFeedMutation.mutate(id);
    }
  };

  const handleRefreshFeed = (id: number) => {
    refreshFeedMutation.mutate(id);
  };

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">OD</span>
              </div>
              <nav className="flex space-x-2 text-sm">
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Admin
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">RSS Feeds</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/admin'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RSS Feed Management</h1>
            <p className="mt-2 text-gray-600">Manage external RSS feeds for content aggregation</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingFeed(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add RSS Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFeed ? "Edit RSS Feed" : "Create RSS Feed"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(editingFeed ? handleUpdateFeed : handleCreateFeed)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feed Name (English)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., BBC News" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feed Name (Hindi)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., बीबीसी न्यूज़" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="feedUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RSS Feed URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://feeds.bbci.co.uk/news/rss.xml" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descriptionHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Hindi)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFeedMutation.isPending || updateFeedMutation.isPending}>
                      {editingFeed ? "Update" : "Create"} RSS Feed
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* RSS Feeds List */}
        <div className="grid gap-6">
          {feedsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feeds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No RSS feeds</h3>
                <p className="text-gray-600 mb-4">Start by adding your first RSS feed</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Globe className="w-4 h-4 mr-2" />
                  Add RSS Feed
                </Button>
              </CardContent>
            </Card>
          ) : (
            feeds.map((feed: RssFeed) => (
              <Card key={feed.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{feed.name}</h3>
                        {feed.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{feed.nameHindi}</p>
                      {feed.description && (
                        <p className="text-sm text-gray-500 mb-4">{feed.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {feed.feedUrl}
                        </span>
                        {feed.lastFetched && (
                          <span>Last fetched: {new Date(feed.lastFetched).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(feed.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshFeed(feed.id)}
                        disabled={refreshFeedMutation.isPending}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFeed(feed)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}