import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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
  FileText,
  ArrowLeft
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
  title: string;
  titleHindi: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  content: z.string().min(1, "Content is required"),
  contentHindi: z.string().min(1, "Hindi content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  excerptHindi: z.string().min(1, "Hindi excerpt is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  authorName: z.string().optional(),
  isBreaking: z.boolean().default(false),
  isTrending: z.boolean().default(false),
});

export default function AdminArticles() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (!response.ok) {
          setLocation('/admin/login');
        }
      } catch (error) {
        setLocation('/admin/login');
      }
    };
    checkAuth();
  }, [setLocation]);

  // Fetch articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles?limit=100');
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      content: "",
      contentHindi: "",
      excerpt: "",
      excerptHindi: "",
      imageUrl: "",
      categoryId: "",
      authorName: "",
      isBreaking: false,
      isTrending: false,
    },
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        imageUrl: data.imageUrl || null,
        authorName: data.authorName || null,
      };
      return await apiRequest("/api/admin/articles", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Article created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      });
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema> & { id: number }) => {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        imageUrl: data.imageUrl || null,
        authorName: data.authorName || null,
      };
      return await apiRequest(`/api/admin/articles/${data.id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setIsDialogOpen(false);
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
        description: "Failed to update article",
        variant: "destructive",
      });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/articles/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingArticle) {
      updateMutation.mutate({ ...data, id: editingArticle.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      titleHindi: article.titleHindi,
      content: article.content,
      contentHindi: article.contentHindi,
      excerpt: article.excerpt,
      excerptHindi: article.excerptHindi,
      imageUrl: article.imageUrl || "",
      categoryId: article.categoryId?.toString() || "",
      authorName: article.authorName || "",
      isBreaking: article.isBreaking || false,
      isTrending: article.isTrending || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredArticles = articles.filter((article: Article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.titleHindi.includes(searchTerm);
    const matchesCategory = !selectedCategory || selectedCategory === "all" || article.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "No Category";
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category ? category.title : "Unknown";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Article Management</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: Category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingArticle(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                Fill in the article details in both English and Hindi
              </DialogDescription>
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
                        <FormLabel>Title (Hindi)</FormLabel>
                        <FormControl>
                          <Input placeholder="हिंदी शीर्षक दर्ज करें" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt (English)</FormLabel>
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
                        <FormLabel>Excerpt (Hindi)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="हिंदी सारांश दर्ज करें" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (English)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter English content" 
                            className="min-h-32"
                            {...field} 
                          />
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
                        <FormLabel>Content (Hindi)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="हिंदी सामग्री दर्ज करें"
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
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
                            {categories.map((category: Category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                              >
                                {category.title}
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
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
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
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isBreaking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Trending</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingArticle ? "Update Article" : "Create Article"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Articles Grid */}
      {articlesLoading ? (
        <div className="text-center py-8">Loading articles...</div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article: Article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                      {article.titleHindi}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {getCategoryName(article.categoryId)}
                      </Badge>
                      {article.isBreaking && (
                        <Badge variant="destructive">Breaking</Badge>
                      )}
                      {article.isTrending && (
                        <Badge variant="secondary">Trending</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <span>By: {article.authorName || "Unknown"}</span>
                  <span>
                    {article.createdAt 
                      ? new Date(article.createdAt).toLocaleDateString()
                      : "No date"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No articles found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}