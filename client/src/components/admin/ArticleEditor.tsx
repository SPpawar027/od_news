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
    titleHindi: article?.titleHindi || "",
    excerptHindi: article?.excerptHindi || "",
    contentHindi: article?.contentHindi || "",
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
      // Add required fields for backend compatibility
      const articleData = {
        ...data,
        title: data.titleHindi, // Use Hindi title as main title
        content: data.contentHindi, // Use Hindi content as main content
        excerpt: data.excerptHindi, // Use Hindi excerpt as main excerpt
      };
      
      if (article) {
        return apiRequest(`/api/admin/articles/${article.id}`, {
          method: "PUT",
          body: JSON.stringify(articleData),
        });
      } else {
        return apiRequest("/api/admin/articles", {
          method: "POST",
          body: JSON.stringify(articleData),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "सफलता",
        description: `लेख ${article ? "अपडेट" : "बनाया गया"} सफलतापूर्वक`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "त्रुटि",
        description: error.message || "लेख सेव करने में विफल",
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
            title: "सफलता",
            description: "छवि अपलोड सफल",
          });
        },
        onError: () => {
          toast({
            title: "त्रुटि",
            description: "छवि अपलोड विफल",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleSave = () => {
    if (!formData.titleHindi || !formData.contentHindi) {
      toast({
        title: "त्रुटि",
        description: "शीर्षक और सामग्री आवश्यक है",
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
        title: "जानकारी",
        description: "कृपया पहले लेख सेव करें",
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
            वापस
          </Button>
          <h1 className="text-2xl font-bold">
            {article ? "लेख संपादित करें" : "नया लेख बनाएं"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            पूर्वावलोकन
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "सेव हो रहा है..." : "लेख सेव करें"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>लेख सामग्री</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title in Hindi */}
              <div>
                <Label htmlFor="titleHindi">शीर्षक (Title in Hindi)</Label>
                <Input
                  id="titleHindi"
                  value={formData.titleHindi}
                  onChange={(e) => handleInputChange("titleHindi", e.target.value)}
                  placeholder="लेख का शीर्षक दर्ज करें..."
                  className="text-lg"
                />
              </div>

              {/* Excerpt in Hindi */}
              <div>
                <Label htmlFor="excerptHindi">सारांश (Excerpt Hindi)</Label>
                <Textarea
                  id="excerptHindi"
                  value={formData.excerptHindi}
                  onChange={(e) => handleInputChange("excerptHindi", e.target.value)}
                  placeholder="संक्षिप्त विवरण..."
                  rows={3}
                />
              </div>

              {/* Content in Hindi */}
              <div>
                <Label htmlFor="contentHindi">सामग्री (Content Hindi)</Label>
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
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>श्रेणी</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="category">Select Category</Label>
                <Select value={formData.categoryId?.toString() || ""} onValueChange={(value) => handleInputChange("categoryId", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="श्रेणी चुनें..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as Category[]).map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.titleHindi || category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle>लेखक</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => handleInputChange("authorName", e.target.value)}
                  placeholder="Author name..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>फीचर्ड छवि</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Featured Image</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="Image URL only"
                />
              </div>
              
              {formData.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="imageUpload">या छवि अपलोड करें</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadMutation.isPending}
                />
                {uploadMutation.isPending && (
                  <p className="text-sm text-gray-500 mt-1">अपलोड हो रहा है...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Article Options */}
          <Card>
            <CardHeader>
              <CardTitle>लेख विकल्प</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isBreaking">Breaking News</Label>
                <Switch
                  id="isBreaking"
                  checked={formData.isBreaking}
                  onCheckedChange={(checked) => handleInputChange("isBreaking", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isTrending">Trending Article</Label>
                <Switch
                  id="isTrending"
                  checked={formData.isTrending}
                  onCheckedChange={(checked) => handleInputChange("isTrending", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}