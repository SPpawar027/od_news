import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Calendar,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ArticleEditor from "./ArticleEditor";
import type { Article, Category } from "@shared/schema";

export default function ArticleManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    queryFn: async () => {
      const response = await fetch("/api/admin/articles", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: "Article deleted successfully",
      });
    },
  });

  const toggleBreakingMutation = useMutation({
    mutationFn: async ({ id, isBreaking }: { id: number; isBreaking: boolean }) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isBreaking: !isBreaking }),
      });
      if (!response.ok) throw new Error("Failed to update article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
    },
  });

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.categoryId.toString() === selectedCategory;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && article.publishedAt) ||
                         (statusFilter === "draft" && !article.publishedAt) ||
                         (statusFilter === "breaking" && article.isBreaking) ||
                         (statusFilter === "featured" && article.isFeatured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.publishedAt).length,
    drafts: articles.filter(a => !a.publishedAt).length,
    breaking: articles.filter(a => a.isBreaking).length,
    featured: articles.filter(a => a.isFeatured).length,
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  const getStatusBadge = (article: Article) => {
    if (article.isBreaking) {
      return <Badge className="bg-red-600 text-white">Breaking</Badge>;
    }
    if (article.isFeatured) {
      return <Badge className="bg-blue-600 text-white">Featured</Badge>;
    }
    if (article.publishedAt) {
      return <Badge className="bg-green-600 text-white">Published</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-xl font-bold">{stats.drafts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Breaking</p>
                <p className="text-xl font-bold">{stats.breaking}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
                <p className="text-xl font-bold">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Management</CardTitle>
            <Button 
              onClick={handleCreateNew}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search articles, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="breaking">Breaking News</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Articles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading articles...
                    </TableCell>
                  </TableRow>
                ) : filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => {
                    const category = categories.find(c => c.id === article.categoryId);
                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {article.imageUrl && (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-medium line-clamp-1">{article.title}</h4>
                              {article.titleHindi && (
                                <p className="text-sm text-gray-500 line-clamp-1">{article.titleHindi}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{article.authorName || "Unknown"}</TableCell>
                        <TableCell>{category?.title || "Uncategorized"}</TableCell>
                        <TableCell>{getStatusBadge(article)}</TableCell>
                        <TableCell>
                          {article.publishedAt ? 
                            format(new Date(article.publishedAt), "MMM dd, yyyy") : 
                            format(new Date(article.createdAt), "MMM dd, yyyy")
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(article)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBreakingMutation.mutate({
                                id: article.id,
                                isBreaking: article.isBreaking || false
                              })}
                            >
                              <AlertCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/article/${article.id}`, '_blank')}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteArticleMutation.mutate(article.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Article Editor Modal */}
      {showEditor && (
        <ArticleEditor
          article={editingArticle || undefined}
          onClose={handleCloseEditor}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
          }}
        />
      )}
    </div>
  );
}