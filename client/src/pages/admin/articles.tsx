import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  TrendingUp,
  Hash,
  Image,
  Globe,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: number;
  title: string;
  titleHindi: string;
  content: string;
  contentHindi: string;
  excerpt: string;
  excerptHindi: string;
  imageUrl: string | null;
  categoryId: number | null;
  authorName: string | null;
  isBreaking: boolean | null;
  isTrending: boolean | null;
  publishedAt: Date | null;
  createdAt: Date | null;
}

interface Category {
  id: number;
  name: string;
  nameHindi: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean | null;
}

const articleSchema = z.object({
  title: z.string().min(1, "English title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  content: z.string().min(1, "English content is required"),
  contentHindi: z.string().min(1, "Hindi content is required"),
  excerpt: z.string().min(1, "English excerpt is required"),
  excerptHindi: z.string().min(1, "Hindi excerpt is required"),
  categoryId: z.number().min(1, "Category is required"),
  authorName: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isBreaking: z.boolean().optional(),
  isTrending: z.boolean().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function AdminArticles() {
  const { user, isAuthenticated } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      content: "",
      contentHindi: "",
      excerpt: "",
      excerptHindi: "",
      categoryId: 0,
      authorName: "",
      imageUrl: "",
      isBreaking: false,
      isTrending: false,
    },
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      return await apiRequest("/api/admin/articles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Article created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create article",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleFormData }) => {
      return await apiRequest(`/api/admin/articles/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      setEditingArticle(null);
      form.reset();
      toast({
        title: "Success",
        description: "Article updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update article",
        variant: "destructive",
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const handleCreateArticle = (data: ArticleFormData) => {
    createArticleMutation.mutate(data);
  };

  const handleUpdateArticle = (data: ArticleFormData) => {
    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, data });
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      titleHindi: article.titleHindi,
      content: article.content,
      contentHindi: article.contentHindi,
      excerpt: article.excerpt,
      excerptHindi: article.excerptHindi,
      categoryId: article.categoryId || 0,
      authorName: article.authorName || "",
      imageUrl: article.imageUrl || "",
      isBreaking: article.isBreaking || false,
      isTrending: article.isTrending || false,
    });
  };

  const handleDeleteArticle = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(id);
    }
  };

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.titleHindi.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || article.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getCategoryName = (categoryId: number | null) => {
    const category = categories?.find(c => c.id === categoryId);
    return category ? category.nameHindi : "No Category";
  };

  if (!isAuthenticated) {
    window.location.href = "/admin/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Article Management</h1>
            <p className="text-gray-600 mt-2">Create, edit and manage news articles</p>
          </div>
          <Dialog open={isCreateDialogOpen || !!editingArticle} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingArticle(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingArticle ? "Edit Article" : "Create New Article"}</DialogTitle>
                <DialogDescription>
                  {editingArticle ? "Update the article details below" : "Fill in the details to create a new article"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(editingArticle ? handleUpdateArticle : handleCreateArticle)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter English title" {...field} />
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
                          <FormLabel>Hindi Title</FormLabel>
                          <FormControl>
                            <Input placeholder="हिंदी शीर्षक दर्ज करें" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English Excerpt</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter English excerpt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="excerptHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hindi Excerpt</FormLabel>
                          <FormControl>
                            <Textarea placeholder="हिंदी सारांश दर्ज करें" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English Content</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter English content" rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contentHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hindi Content</FormLabel>
                          <FormControl>
                            <Textarea placeholder="हिंदी सामग्री दर्ज करें" rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.nameHindi}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Reporter/Author name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isBreaking"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel>Breaking News</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isTrending"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel>Trending</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingArticle(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createArticleMutation.isPending || updateArticleMutation.isPending ? 
                        "Saving..." : 
                        (editingArticle ? "Update Article" : "Create Article")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nameHindi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        {articlesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{getCategoryName(article.categoryId)}</Badge>
                        {article.isBreaking && (
                          <Badge className="bg-red-100 text-red-800">Breaking</Badge>
                        )}
                        {article.isTrending && (
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{article.title}</h3>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{article.titleHindi}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
                        </div>
                        {article.authorName && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {article.authorName}
                          </div>
                        )}
                        {article.imageUrl && (
                          <div className="flex items-center">
                            <Image className="w-3 h-3 mr-1" />
                            Image
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteArticle(article.id)}
                        disabled={deleteArticleMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-500">Get started by creating your first article.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}