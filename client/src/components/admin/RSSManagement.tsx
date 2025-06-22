import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Rss,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Zap,
  TrendingUp,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { RssSource, InsertRssSource } from "@shared/schema";

const rssSchema = z.object({
  name: z.string().min(1, "Source name is required"),
  url: z.string().url("Valid RSS URL is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  autoImport: z.boolean().default(true),
  importInterval: z.number().min(5).max(1440), // 5 minutes to 24 hours
  priority: z.enum(["low", "medium", "high"]),
});

type RSSFormData = z.infer<typeof rssSchema>;

export default function RSSManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSource, setEditingSource] = useState<RssSource | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RSSFormData>({
    resolver: zodResolver(rssSchema),
    defaultValues: {
      name: "",
      url: "",
      category: "news",
      isActive: true,
      autoImport: true,
      importInterval: 60, // 1 hour
      priority: "medium",
    },
  });

  const { data: sources = [], isLoading } = useQuery<RssSource[]>({
    queryKey: ["/api/admin/rss-sources"],
    queryFn: async () => {
      const response = await fetch("/api/admin/rss-sources", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch RSS sources");
      return response.json();
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: async (data: RSSFormData) => {
      const response = await fetch("/api/admin/rss-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create RSS source");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "RSS source created successfully",
      });
    },
  });

  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RSSFormData> }) => {
      const response = await fetch(`/api/admin/rss-sources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update RSS source");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      setEditingSource(null);
      toast({
        title: "RSS source updated successfully",
      });
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/rss-sources/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete RSS source");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      toast({
        title: "RSS source deleted successfully",
      });
    },
  });

  const toggleSourceMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/rss-sources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle RSS source");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
    },
  });

  const syncSourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/rss-sources/${id}/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to sync RSS source");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rss-sources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: `Imported ${data.count} new articles`,
      });
    },
  });

  const handleEdit = (source: RssSource) => {
    setEditingSource(source);
    form.reset({
      name: source.name,
      url: source.url,
      category: source.category || "news",
      isActive: source.isActive,
      autoImport: source.autoImport,
      importInterval: source.importInterval,
      priority: source.priority as "low" | "medium" | "high",
    });
    setShowAddDialog(true);
  };

  const handleSave = (data: RSSFormData) => {
    if (editingSource) {
      updateSourceMutation.mutate({ id: editingSource.id, data });
    } else {
      createSourceMutation.mutate(data);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      "low": "bg-gray-500",
      "medium": "bg-blue-500",
      "high": "bg-red-500"
    };
    return (
      <Badge className={`${colors[priority as keyof typeof colors]} text-white`}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (source: RssSource) => {
    if (!source.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (source.lastSyncAt) {
      const lastSync = new Date(source.lastSyncAt);
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        return <Badge className="bg-orange-500 text-white">Stale</Badge>;
      }
    }
    return <Badge className="bg-green-500 text-white">Active</Badge>;
  };

  const stats = {
    total: sources.length,
    active: sources.filter(s => s.isActive).length,
    autoImport: sources.filter(s => s.autoImport).length,
    totalArticles: sources.reduce((sum, s) => sum + (s.articlesImported || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rss className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sources</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Auto Import</p>
                <p className="text-xl font-bold">{stats.autoImport}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Imported Articles</p>
                <p className="text-xl font-bold">{stats.totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RSS Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>RSS Feed Auto-Import System</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  sources.forEach(source => {
                    if (source.isActive) {
                      syncSourceMutation.mutate(source.id);
                    }
                  });
                }}
                disabled={syncSourceMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingSource(null);
                      form.reset();
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
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
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Source Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="BBC News RSS" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="news">News</SelectItem>
                                  <SelectItem value="politics">Politics</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="sports">Sports</SelectItem>
                                  <SelectItem value="technology">Technology</SelectItem>
                                  <SelectItem value="entertainment">Entertainment</SelectItem>
                                  <SelectItem value="health">Health</SelectItem>
                                  <SelectItem value="science">Science</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RSS Feed URL *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://feeds.bbci.co.uk/news/rss.xml"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="importInterval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Import Interval (minutes)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select interval" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="5">5 minutes</SelectItem>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                  <SelectItem value="360">6 hours</SelectItem>
                                  <SelectItem value="720">12 hours</SelectItem>
                                  <SelectItem value="1440">24 hours</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Source</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Enable this RSS feed for importing
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="autoImport"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Auto Import</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Automatically import new articles from this feed
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createSourceMutation.isPending || updateSourceMutation.isPending}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {editingSource ? "Update" : "Add"} Source
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading RSS sources...
                    </TableCell>
                  </TableRow>
                ) : sources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No RSS sources found. Add your first source to get started with auto-import.
                    </TableCell>
                  </TableRow>
                ) : (
                  sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">
                            <Rss className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{source.name}</h4>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{source.url}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{source.category}</TableCell>
                      <TableCell>{getStatusBadge(source)}</TableCell>
                      <TableCell>{getPriorityBadge(source.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{source.importInterval}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {source.lastSyncAt ? (
                          <span className="text-sm">
                            {format(new Date(source.lastSyncAt), "MMM dd, HH:mm")}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Never</span>
                        )}
                      </TableCell>
                      <TableCell>{source.articlesImported || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncSourceMutation.mutate(source.id)}
                            disabled={syncSourceMutation.isPending}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSourceMutation.mutate({
                              id: source.id,
                              isActive: source.isActive
                            })}
                          >
                            {source.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(source)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSourceMutation.mutate(source.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}