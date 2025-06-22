import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, RefreshCw, Rss, Clock } from "lucide-react";
import { format } from "date-fns";
import type { RssSource } from "@/../../shared/schema";

export default function RSSManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RssSource | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["/api/admin/rss-sources"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/rss-sources", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      setShowDialog(false);
      setEditingSource(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/rss-sources/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      setShowDialog(false);
      setEditingSource(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/rss-sources/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/rss-sources/${id}/sync`, {
        method: "POST",
      });
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      // Show success message with article count
      if (data.articlesImported) {
        alert(`Sync completed! Imported ${data.articlesImported} new articles.`);
      }
    },
    onError: (error) => {
      console.error("Sync failed:", error);
      alert("Failed to sync RSS feed. Please try again.");
    },
  });

  const filteredSources = sources.filter((source: RssSource) =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      categoryId: parseInt(formData.get("categoryId") as string) || null,
      fetchInterval: parseInt(formData.get("fetchInterval") as string) || 60,
      isActive: formData.get("isActive") === "true",
    };

    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (source: RssSource) => {
    setEditingSource(source);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this RSS source?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSync = (id: number) => {
    syncMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search RSS sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add RSS Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? "Edit RSS Source" : "Add New RSS Source"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingSource?.name}
                  placeholder="BBC News, Times of India, etc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="url">RSS Feed URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={editingSource?.url}
                  placeholder="https://feeds.bbci.co.uk/news/rss.xml"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Default Category</Label>
                  <Select name="categoryId" defaultValue={editingSource?.categoryId?.toString() || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Politics</SelectItem>
                      <SelectItem value="2">Sports</SelectItem>
                      <SelectItem value="3">Technology</SelectItem>
                      <SelectItem value="4">Entertainment</SelectItem>
                      <SelectItem value="5">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fetchInterval">Sync Interval (minutes)</Label>
                  <Select name="fetchInterval" defaultValue={editingSource?.fetchInterval?.toString() || "60"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="360">6 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select name="isActive" defaultValue={editingSource?.isActive ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingSource(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingSource ? "Update" : "Add"} Source
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* RSS Sources Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((source: RssSource) => (
            <Card key={source.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                    <Rss className="w-4 h-4 text-orange-500" />
                    {source.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant={source.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {source.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {source.url}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Interval:</span>
                    <span>{source.fetchInterval || 60} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Sync:</span>
                    <span>
                      {source.lastFetch 
                        ? format(new Date(source.lastFetch), "MMM dd, HH:mm")
                        : "Never"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Articles Imported:</span>
                    <Badge variant="outline" className="text-xs">
                      {source.articlesImported || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(source.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(source)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(source.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSources.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No RSS sources found</p>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First RSS Source
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}