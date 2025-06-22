import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Edit, Trash2, AlertTriangle, Zap } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface BreakingNews {
  id: number;
  title: string;
  titleHindi: string;
  priority: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

const breakingNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  priority: z.number().min(1).max(10).default(5),
  isActive: z.boolean().default(true),
});

type BreakingNewsFormData = z.infer<typeof breakingNewsSchema>;

export default function AdminBreakingNews() {
  const { user, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const [editingNews, setEditingNews] = useState<BreakingNews | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<BreakingNewsFormData>({
    resolver: zodResolver(breakingNewsSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      priority: 5,
      isActive: true,
    },
  });

  const { data: breakingNews = [], isLoading: newsLoading } = useQuery({
    queryKey: ["/api/admin/breaking-news"],
    enabled: isAuthenticated,
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: BreakingNewsFormData) => {
      const response = await fetch("/api/admin/breaking-news", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create breaking news");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      toast({ title: "Success", description: "Breaking news created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create breaking news", variant: "destructive" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BreakingNewsFormData }) => {
      const response = await fetch(`/api/admin/breaking-news/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update breaking news");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      toast({ title: "Success", description: "Breaking news updated successfully" });
      setIsDialogOpen(false);
      setEditingNews(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update breaking news", variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/breaking-news/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete breaking news");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      toast({ title: "Success", description: "Breaking news deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete breaking news", variant: "destructive" });
    },
  });

  const handleCreateNews = (data: BreakingNewsFormData) => {
    createNewsMutation.mutate(data);
  };

  const handleUpdateNews = (data: BreakingNewsFormData) => {
    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data });
    }
  };

  const handleEditNews = (news: BreakingNews) => {
    setEditingNews(news);
    form.reset({
      title: news.title,
      titleHindi: news.titleHindi,
      priority: news.priority || 5,
      isActive: news.isActive || true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteNews = (id: number) => {
    if (confirm("Are you sure you want to delete this breaking news?")) {
      deleteNewsMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return "bg-gray-100 text-gray-800";
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 6) return "bg-orange-100 text-orange-800";
    if (priority >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPriorityLabel = (priority: number | null) => {
    if (!priority) return "Normal";
    if (priority >= 8) return "Critical";
    if (priority >= 6) return "High";
    if (priority >= 4) return "Medium";
    return "Low";
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
                <span className="text-gray-900 font-medium">Breaking News</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Breaking News Management</h1>
            <p className="mt-2 text-gray-600">Manage urgent news alerts and breaking stories</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingNews(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Breaking News
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? "Edit Breaking News" : "Create Breaking News"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(editingNews ? handleUpdateNews : handleCreateNews)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Breaking news title..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleHindi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (Hindi)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ब्रेकिंग न्यूज़ शीर्षक..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="10" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">
                          1-3: Low, 4-6: Medium, 7-8: High, 9-10: Critical
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    <Button type="submit" disabled={createNewsMutation.isPending || updateNewsMutation.isPending}>
                      {editingNews ? "Update" : "Create"} Breaking News
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Breaking News List */}
        <div className="grid gap-4">
          {newsLoading ? (
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
          ) : breakingNews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No breaking news</h3>
                <p className="text-gray-600 mb-4">Create your first breaking news alert</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Zap className="w-4 h-4 mr-2" />
                  Add Breaking News
                </Button>
              </CardContent>
            </Card>
          ) : (
            breakingNews
              .sort((a: BreakingNews, b: BreakingNews) => (b.priority || 0) - (a.priority || 0))
              .map((news: BreakingNews) => (
                <Card key={news.id} className={news.isActive ? "border-l-4 border-l-red-500" : ""}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{news.title}</h3>
                          <Badge className={getPriorityColor(news.priority)}>
                            {getPriorityLabel(news.priority)}
                          </Badge>
                          {news.isActive ? (
                            <Badge variant="destructive">LIVE</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{news.titleHindi}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Priority: {news.priority || 'N/A'}</span>
                          <span>Created: {new Date(news.createdAt!).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNews(news)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNews(news.id)}
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