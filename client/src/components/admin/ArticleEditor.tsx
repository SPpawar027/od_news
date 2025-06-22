import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Article, Category } from "@/../../shared/schema";

interface ArticleEditorProps {
  article?: Article;
  onClose: () => void;
  onSave: () => void;
}

export default function ArticleEditor({ article, onClose, onSave }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: article?.title || "",
    titleHindi: article?.titleHindi || "",
    content: article?.content || "",
    contentHindi: article?.contentHindi || "",
    excerpt: article?.excerpt || "",
    excerptHindi: article?.excerptHindi || "",
    imageUrl: article?.imageUrl || "",
    authorName: article?.authorName || "",
    categoryId: article?.categoryId || null,
    isBreaking: article?.isBreaking || false,
    isTrending: article?.isTrending || false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      return apiRequest("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (article) {
        return apiRequest(`/api/admin/articles/${article.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/admin/articles", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Article ${article ? "updated" : "created"} successfully`,
      });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file, {
        onSuccess: (response: any) => {
          handleInputChange("imageUrl", response.url);
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handlePreview = () => {
    if (article?.id) {
      window.open(`/article/${article.id}`, '_blank');
    } else {
      toast({
        title: "Info",
        description: "Please save the article first to preview it",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {article ? "Edit Article" : "Create New Article"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>
                <div>
                  <Label htmlFor="titleHindi">Title (Hindi)</Label>
                  <Input
                    id="titleHindi"
                    value={formData.titleHindi}
                    onChange={(e) => handleInputChange("titleHindi", e.target.value)}
                    placeholder="लेख का शीर्षक दर्ज करें..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excerpt">Excerpt (English)</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="excerptHindi">Excerpt (Hindi)</Label>
                  <Textarea
                    id="excerptHindi"
                    value={formData.excerptHindi}
                    onChange={(e) => handleInputChange("excerptHindi", e.target.value)}
                    placeholder="संक्षिप्त विवरण..."
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content (English)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Write your article content here..."
                  rows={12}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="contentHindi">Content (Hindi)</Label>
                <Textarea
                  id="contentHindi"
                  value={formData.contentHindi}
                  onChange={(e) => handleInputChange("contentHindi", e.target.value)}
                  placeholder="अपना लेख यहाँ लिखें..."
                  rows={12}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.categoryId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("categoryId", parseInt(value) || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName || ""}
                  onChange={(e) => handleInputChange("authorName", e.target.value)}
                  placeholder="Author name..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isBreaking">Breaking News</Label>
                  <Switch
                    id="isBreaking"
                    checked={formData.isBreaking || false}
                    onCheckedChange={(checked) => handleInputChange("isBreaking", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isTrending">Trending Article</Label>
                  <Switch
                    id="isTrending"
                    checked={formData.isTrending || false}
                    onCheckedChange={(checked) => handleInputChange("isTrending", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUpload">Upload Image</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("imageUpload")?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadMutation.isPending ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              </div>

              {formData.imageUrl && (
                <div>
                  <Label>Preview</Label>
                  <img
                    src={formData.imageUrl}
                    alt="Article preview"
                    className="w-full h-32 object-cover rounded-md mt-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}