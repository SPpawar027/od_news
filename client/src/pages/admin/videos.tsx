import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Edit, Trash2, Video, PlayCircle, Upload } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Video {
  id: number;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  categoryId: number | null;
  duration: string | null;
  isLive: boolean | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleHindi: z.string().min(1, "Hindi title is required"),
  description: z.string().min(1, "Description is required"),
  descriptionHindi: z.string().min(1, "Hindi description is required"),
  videoUrl: z.string().url("Valid video URL is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.number().optional(),
  duration: z.string().optional(),
  isLive: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function AdminVideos() {
  const { user, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      description: "",
      descriptionHindi: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "",
      isLive: false,
      isActive: true,
    },
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["/api/admin/videos"],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Success", description: "Video created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create video", variant: "destructive" });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VideoFormData }) => {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Success", description: "Video updated successfully" });
      setIsDialogOpen(false);
      setEditingVideo(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update video", variant: "destructive" });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({ title: "Success", description: "Video deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete video", variant: "destructive" });
    },
  });

  const handleCreateVideo = (data: VideoFormData) => {
    createVideoMutation.mutate(data);
  };

  const handleUpdateVideo = (data: VideoFormData) => {
    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data });
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    form.reset({
      title: video.title,
      titleHindi: video.titleHindi,
      description: video.description,
      descriptionHindi: video.descriptionHindi,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      categoryId: video.categoryId || undefined,
      duration: video.duration || "",
      isLive: video.isLive || false,
      isActive: video.isActive || true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVideo = (id: number) => {
    if (confirm("Are you sure you want to delete this video?")) {
      deleteVideoMutation.mutate(id);
    }
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
                <span className="text-gray-900 font-medium">Videos</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
            <p className="mt-2 text-gray-600">Upload and manage your video content</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingVideo(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? "Edit Video" : "Create New Video"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(editingVideo ? handleUpdateVideo : handleCreateVideo)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (English)</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descriptionHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Hindi)</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 10:30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex space-x-6">
                    <FormField
                      control={form.control}
                      name="isLive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>Live Video</FormLabel>
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
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createVideoMutation.isPending || updateVideoMutation.isPending}>
                      {editingVideo ? "Update" : "Create"} Video
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Videos List */}
        <div className="grid gap-6">
          {videosLoading ? (
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
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
                <p className="text-gray-600 mb-4">Start by uploading your first video</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            videos.map((video: Video) => (
              <Card key={video.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        {video.isLive && <Badge variant="destructive">LIVE</Badge>}
                        {!video.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-gray-600 mb-2">{video.titleHindi}</p>
                      <p className="text-sm text-gray-500 mb-4">{video.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {video.duration && (
                          <span className="flex items-center">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            {video.duration}
                          </span>
                        )}
                        <span>Created: {new Date(video.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVideo(video)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVideo(video.id)}
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