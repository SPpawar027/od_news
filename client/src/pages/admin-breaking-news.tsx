import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Zap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { BreakingNews } from "@shared/schema";

const breakingNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

type BreakingNewsForm = z.infer<typeof breakingNewsSchema>;

export default function AdminBreakingNewsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<BreakingNews | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: breakingNews = [], isLoading } = useQuery<BreakingNews[]>({
    queryKey: ["/api/admin/breaking-news"],
  });

  const form = useForm<BreakingNewsForm>({
    resolver: zodResolver(breakingNewsSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      content: "",
      priority: "medium",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BreakingNewsForm) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      return apiRequest("/api/admin/breaking-news", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Breaking news created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create breaking news",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BreakingNewsForm) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      return apiRequest(`/api/admin/breaking-news/${editingNews!.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      setIsDialogOpen(false);
      setEditingNews(null);
      form.reset();
      toast({
        title: "Success",
        description: "Breaking news updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update breaking news",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/breaking-news/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/breaking-news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/breaking-news"] });
      toast({
        title: "Success",
        description: "Breaking news deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete breaking news",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BreakingNewsForm) => {
    if (editingNews) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (news: BreakingNews) => {
    setEditingNews(news);
    form.reset({
      title: news.title,
      titleHindi: news.titleHindi,
      content: news.content,
      priority: news.priority as any,
      isActive: news.isActive,
      expiresAt: news.expiresAt ? new Date(news.expiresAt).toISOString().slice(0, 16) : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this breaking news?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Breaking News Management</h1>
                <p className="text-gray-600 mt-2">Manage breaking news alerts and ticker content</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingNews(null);
                      form.reset();
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Breaking News
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNews ? "Edit Breaking News" : "Add Breaking News"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title (English)</FormLabel>
                              <FormControl>
                                <Input placeholder="Breaking news title..." {...field} />
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
                                <Input placeholder="ब्रेकिंग न्यूज़ शीर्षक..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Breaking news content..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <FormControl>
                                <select className="w-full p-2 border rounded-md" {...field}>
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expires At (Optional)</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 pt-8">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4"
                                />
                              </FormControl>
                              <FormLabel>Active</FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {editingNews ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {breakingNews.map((news) => (
                  <Card key={news.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(news.priority)}`}></div>
                            <span className="text-sm text-gray-500 uppercase font-semibold">
                              {news.priority} Priority
                            </span>
                            {news.isActive ? (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                <Zap className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                Inactive
                              </span>
                            )}
                            {news.expiresAt && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Expires: {new Date(news.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {news.titleHindi}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{news.title}</p>
                          <p className="text-gray-700">{news.content}</p>
                          
                          <div className="mt-4 text-sm text-gray-500">
                            Created: {new Date(news.createdAt).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(news)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(news.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {breakingNews.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Breaking News
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Create your first breaking news alert to get started.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}