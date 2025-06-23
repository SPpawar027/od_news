import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Search, Home, Globe, Users, Briefcase, Heart, Camera, Trophy, Music, Car, Gamepad2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { Category } from "@shared/schema";

const categorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  slug: z.string().min(1, "Slug is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

type CategoryForm = z.infer<typeof categorySchema>;

const availableIcons = [
  { name: "Home", icon: Home, value: "Home" },
  { name: "Globe", icon: Globe, value: "Globe" },
  { name: "Users", icon: Users, value: "Users" },
  { name: "Briefcase", icon: Briefcase, value: "Briefcase" },
  { name: "Heart", icon: Heart, value: "Heart" },
  { name: "Camera", icon: Camera, value: "Camera" },
  { name: "Trophy", icon: Trophy, value: "Trophy" },
  { name: "Music", icon: Music, value: "Music" },
  { name: "Car", icon: Car, value: "Car" },
  { name: "Gamepad2", icon: Gamepad2, value: "Gamepad2" },
  { name: "Sparkles", icon: Sparkles, value: "Sparkles" },
];

const availableColors = [
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Green", value: "#22c55e", bg: "bg-green-500" },
  { name: "Purple", value: "#a855f7", bg: "bg-purple-500" },
  { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
  { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
  { name: "Yellow", value: "#eab308", bg: "bg-yellow-500" },
];

export default function AdminCategoriesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Home");
  const [selectedColor, setSelectedColor] = useState("#ef4444");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      slug: "",
      icon: "Home",
      color: "#ef4444",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      return apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowDialog(false);
      setEditingCategory(undefined);
      form.reset();
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryForm }) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowDialog(false);
      setEditingCategory(undefined);
      form.reset();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
  });

  const filteredCategories = categories.filter((category: Category) =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.titleHindi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: CategoryForm) => {
    const categoryData = {
      ...data,
      icon: selectedIcon,
      color: selectedColor,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      createMutation.mutate(categoryData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    form.reset({
      title: category.title,
      titleHindi: category.titleHindi,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.value === iconName);
    return iconData ? iconData.icon : Home;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Category Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage news categories with custom icons and colors for sidebar navigation
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English Title</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., Sports"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    form.setValue('slug', generateSlug(e.target.value));
                                  }}
                                />
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
                                <Input {...field} placeholder="e.g., खेल" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., sports" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Select Icon</label>
                          <div className="grid grid-cols-6 gap-2 mt-2">
                            {availableIcons.map((iconItem) => {
                              const IconComponent = iconItem.icon;
                              return (
                                <button
                                  key={iconItem.value}
                                  type="button"
                                  onClick={() => {
                                    setSelectedIcon(iconItem.value);
                                    form.setValue('icon', iconItem.value);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    selectedIcon === iconItem.value 
                                      ? 'border-red-500 bg-red-50' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <IconComponent className="w-5 h-5 mx-auto" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Select Color</label>
                          <div className="grid grid-cols-8 gap-2 mt-2">
                            {availableColors.map((colorItem) => (
                              <button
                                key={colorItem.value}
                                type="button"
                                onClick={() => {
                                  setSelectedColor(colorItem.value);
                                  form.setValue('color', colorItem.value);
                                }}
                                className={`w-8 h-8 rounded-full border-2 ${colorItem.bg} ${
                                  selectedColor === colorItem.value 
                                    ? 'border-gray-800 scale-110' 
                                    : 'border-gray-300'
                                } transition-all`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {editingCategory ? "Update" : "Create"} Category
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: category.color + '20' }}
                            >
                              <IconComponent 
                                className="w-5 h-5" 
                                style={{ color: category.color }}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.title}</CardTitle>
                              <p className="text-sm text-gray-600 font-hindi">{category.titleHindi}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-gray-500">
                          <div>Slug: /{category.slug}</div>
                          <div>Created: {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}