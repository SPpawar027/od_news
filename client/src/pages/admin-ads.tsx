import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Image, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Advertisement {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

const advertisementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Valid image URL is required"),
  linkUrl: z.string().url("Valid link URL is required").optional().or(z.literal("")),
  position: z.enum(["sidebar", "header", "footer", "content"]),
  width: z.number().min(1).max(2000).optional(),
  height: z.number().min(1).max(2000).optional(),
  isActive: z.boolean().default(true),
});

type AdvertisementForm = z.infer<typeof advertisementSchema>;

export default function AdminAdsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: advertisements = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/admin/advertisements"],
  });

  const [selectedPosition, setSelectedPosition] = useState<string>("sidebar");

  const getDefaultSizeForPosition = (position: string) => {
    switch (position) {
      case "header":
        return { width: 1892, height: 257 };
      case "sidebar":
        return { width: 342, height: 399 };
      case "footer":
        return { width: 1200, height: 200 };
      case "content":
        return { width: 728, height: 90 };
      default:
        return { width: 300, height: 250 };
    }
  };

  const form = useForm<AdvertisementForm>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      linkUrl: "",
      position: "sidebar",
      width: 342,
      height: 399,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AdvertisementForm) => {
      return apiRequest("/api/admin/advertisements", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Advertisement created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create advertisement",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AdvertisementForm) => {
      return apiRequest(`/api/admin/advertisements/${editingAd!.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      setIsDialogOpen(false);
      setEditingAd(null);
      form.reset();
      toast({
        title: "Success",
        description: "Advertisement updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update advertisement",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/advertisements/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete advertisement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdvertisementForm) => {
    if (editingAd) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    form.reset({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || "",
      position: ad.position as any,
      width: ad.width,
      height: ad.height,
      isActive: ad.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case "header": return "bg-blue-100 text-blue-800";
      case "sidebar": return "bg-green-100 text-green-800";
      case "footer": return "bg-purple-100 text-purple-800";
      case "content": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
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
                <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
                <p className="text-gray-600 mt-2">Manage Google Ads and other advertisements across the platform</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingAd(null);
                      form.reset();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Advertisement
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAd ? "Edit Advertisement" : "Add Advertisement"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advertisement Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Google Ad Campaign 1..." {...field} />
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
                              <Input placeholder="https://example.com/ad-image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="linkUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/landing-page" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <select 
                                  className="w-full p-2 border rounded-md" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    const sizes = getDefaultSizeForPosition(e.target.value);
                                    form.setValue("width", sizes.width);
                                    form.setValue("height", sizes.height);
                                  }}
                                >
                                  <option value="sidebar">Sidebar (342px × 399px)</option>
                                  <option value="header">Header Large Banner (1892px × 257px)</option>
                                  <option value="footer">Footer Banner (1200px × 200px)</option>
                                  <option value="content">Content Banner (728px × 90px)</option>
                                </select>
                              </FormControl>
                              <FormDescription>
                                Dimensions will auto-update based on position selection
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Width (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="300"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="250"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="isActive"
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
                            <FormLabel>Active</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={createMutation.isPending || updateMutation.isPending}
                        >
                          {editingAd ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advertisements.map((ad) => (
                  <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Ad+Image";
                          }}
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {ad.isActive ? (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ad.title}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Position:</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPositionColor(ad.position)}`}>
                            {ad.position}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Size:</span>
                          <span className="text-sm text-gray-700">
                            {ad.width}×{ad.height}px
                          </span>
                        </div>
                        
                        {ad.linkUrl && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm truncate"
                            >
                              View Link
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(ad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ad.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {advertisements.length === 0 && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Advertisements
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Create your first advertisement to get started with ad management.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}