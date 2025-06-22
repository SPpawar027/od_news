import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Eye, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Category, Article, InsertArticle } from "@shared/schema";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  contentHindi: z.string().optional(),
  excerpt: z.string().optional(),
  authorName: z.string().min(1, "Author name is required"),
  categoryId: z.number(),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  scheduledAt: z.date().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  article?: Article;
  onClose: () => void;
  onSave: () => void;
}

export default function ArticleEditor({ article, onClose, onSave }: ArticleEditorProps) {
  const [publishType, setPublishType] = useState<'publish' | 'draft' | 'schedule'>('draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      content: "",
      contentHindi: "",
      excerpt: "",
      authorName: "",
      categoryId: 1,
      imageUrl: "",
      tags: "",
      isBreaking: false,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        titleHindi: article.titleHindi || "",
        content: article.content,
        contentHindi: article.contentHindi || "",
        excerpt: article.excerpt || "",
        authorName: article.authorName || "",
        categoryId: article.categoryId,
        imageUrl: article.imageUrl || "",
        tags: article.tags?.join(", ") || "",
        isBreaking: article.isBreaking || false,
        isFeatured: article.isFeatured || false,
        scheduledAt: article.scheduledAt ? new Date(article.scheduledAt) : undefined,
      });
      setImagePreview(article.imageUrl || "");
    }
  }, [article, form]);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("imageUrl", data.url);
      setImagePreview(data.url);
      toast({
        title: "Image uploaded successfully",
      });
    },
  });

  const saveArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData & { publishType: string }) => {
      const payload: Partial<InsertArticle> = {
        title: data.title,
        titleHindi: data.titleHindi || null,
        content: data.content,
        contentHindi: data.contentHindi || null,
        excerpt: data.excerpt || null,
        authorName: data.authorName,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || null,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        isBreaking: data.isBreaking,
        isFeatured: data.isFeatured,
        publishedAt: data.publishType === 'publish' ? new Date() : 
                     data.publishType === 'schedule' && data.scheduledAt ? data.scheduledAt : null,
        scheduledAt: data.publishType === 'schedule' ? data.scheduledAt : null,
      };

      const endpoint = article ? `/api/admin/articles/${article.id}` : "/api/admin/articles";
      const method = article ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Save failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      toast({
        title: article ? "Article updated successfully" : "Article created successfully",
      });
      onSave();
      onClose();
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      uploadImageMutation.mutate(file);
    }
  };

  const handleSave = (data: ArticleFormData) => {
    saveArticleMutation.mutate({ ...data, publishType });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {article ? "Edit Article" : "Create New Article"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSave)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Title (English) *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter article title..."
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="titleHindi">Title (Hindi)</Label>
                <Input
                  id="titleHindi"
                  {...form.register("titleHindi")}
                  placeholder="लेख का शीर्षक दर्ज करें..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  {...form.register("excerpt")}
                  placeholder="Brief summary of the article..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="authorName">Author Name *</Label>
                <Input
                  id="authorName"
                  {...form.register("authorName")}
                  placeholder="Author name..."
                  className="mt-1"
                />
                {form.formState.errors.authorName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.authorName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={form.watch("categoryId")?.toString()}
                  onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  placeholder="politics, breaking, india..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Article Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isBreaking">Breaking News</Label>
                    <Switch
                      id="isBreaking"
                      checked={form.watch("isBreaking")}
                      onCheckedChange={(checked) => form.setValue("isBreaking", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Featured Article</Label>
                    <Switch
                      id="isFeatured"
                      checked={form.watch("isFeatured")}
                      onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                    />
                  </div>

                  <div>
                    <Label>Publish Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={publishType === 'draft' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPublishType('draft')}
                      >
                        Save Draft
                      </Button>
                      <Button
                        type="button"
                        variant={publishType === 'publish' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPublishType('publish')}
                      >
                        Publish Now
                      </Button>
                      <Button
                        type="button"
                        variant={publishType === 'schedule' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPublishType('schedule')}
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>

                  {publishType === 'schedule' && (
                    <div>
                      <Label>Schedule Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !form.watch("scheduledAt") && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("scheduledAt") ? (
                              format(form.watch("scheduledAt")!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.watch("scheduledAt")}
                            onSelect={(date) => form.setValue("scheduledAt", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload image
                          </p>
                        </div>
                      </Label>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            form.setValue("imageUrl", "");
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="imageUrl">Or enter image URL</Label>
                      <Input
                        id="imageUrl"
                        {...form.register("imageUrl")}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                        onChange={(e) => {
                          form.setValue("imageUrl", e.target.value);
                          setImagePreview(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <div>
              <Label>Content (English) *</Label>
              <div className="mt-1">
                <ReactQuill
                  theme="snow"
                  value={form.watch("content")}
                  onChange={(content) => form.setValue("content", content)}
                  modules={modules}
                  placeholder="Write your article content here..."
                  style={{ height: "300px", marginBottom: "50px" }}
                />
              </div>
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div>
              <Label>Content (Hindi)</Label>
              <div className="mt-1">
                <ReactQuill
                  theme="snow"
                  value={form.watch("contentHindi")}
                  onChange={(content) => form.setValue("contentHindi", content)}
                  modules={modules}
                  placeholder="अपना लेख यहाँ लिखें..."
                  style={{ height: "300px", marginBottom: "50px" }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {form.watch("isBreaking") && (
                <Badge className="bg-red-600 text-white">Breaking News</Badge>
              )}
              {form.watch("isFeatured") && (
                <Badge className="bg-blue-600 text-white">Featured</Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                type="submit" 
                disabled={saveArticleMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {publishType === 'publish' ? 'Publish' : 
                 publishType === 'schedule' ? 'Schedule' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}