import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Upload,
  Video as VideoIcon,
  Eye,
  Users,
  Clock,
  FileVideo,
  Youtube,
  Link,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Video, InsertVideo } from "@shared/schema";

const videoSchema = z.object({
  title: z.string().min(1, "Video title is required"),
  titleHindi: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().url("Valid video URL is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  duration: z.string().min(1, "Duration is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  visibility: z.enum(["public", "private", "unlisted"]),
  isVertical: z.boolean().default(false),
  quality: z.enum(["480p", "720p", "1080p", "4k"]),
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function VideoManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      titleHindi: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "",
      category: "entertainment",
      tags: "",
      visibility: "public",
      isVertical: false,
      quality: "720p",
    },
  });

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/admin/videos"],
    queryFn: async () => {
      const response = await fetch("/api/admin/videos", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        viewCount: 0,
        uploadDate: new Date().toISOString(),
      };

      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Video added successfully",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VideoFormData> }) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : undefined,
      };

      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update video");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      setEditingVideo(null);
      toast({
        title: "Video updated successfully",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "Video deleted successfully",
      });
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("video", file);
      
      const response = await fetch("/api/admin/upload-video", {
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
      form.setValue("videoUrl", data.url);
      if (data.thumbnailUrl) {
        form.setValue("thumbnailUrl", data.thumbnailUrl);
      }
      toast({
        title: "Video uploaded successfully",
      });
    },
  });

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    form.reset({
      title: video.title,
      titleHindi: video.titleHindi || "",
      description: video.description || "",
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || "",
      duration: video.duration,
      category: video.category,
      tags: video.tags?.join(", ") || "",
      visibility: video.visibility as "public" | "private" | "unlisted",
      isVertical: video.isVertical,
      quality: video.quality as "480p" | "720p" | "1080p" | "4k",
    });
    setShowAddDialog(true);
  };

  const handleSave = (data: VideoFormData) => {
    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data });
    } else {
      createVideoMutation.mutate(data);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadVideoMutation.mutate(file);
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const colors = {
      "public": "bg-green-500",
      "private": "bg-red-500",
      "unlisted": "bg-yellow-500"
    };
    return (
      <Badge className={`${colors[visibility as keyof typeof colors]} text-white`}>
        {visibility}
      </Badge>
    );
  };

  const formatDuration = (duration: string) => {
    // Convert seconds to MM:SS or HH:MM:SS format
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const stats = {
    total: videos.length,
    public: videos.filter(v => v.visibility === 'public').length,
    private: videos.filter(v => v.visibility === 'private').length,
    totalViews: videos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Videos</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Public</p>
                <p className="text-xl font-bold">{stats.public}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Private</p>
                <p className="text-xl font-bold">{stats.private}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Video Management</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingVideo(null);
                    form.reset();
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingVideo ? "Edit Video" : "Add New Video"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Title (English) *</FormLabel>
                            <FormControl>
                              <Input placeholder="Amazing Entertainment Video" {...field} />
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
                            <FormLabel>Video Title (Hindi)</FormLabel>
                            <FormControl>
                              <Input placeholder="अद्भुत मनोरंजन वीडियो" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your video content..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Video Upload Section */}
                    <div className="space-y-4">
                      <Label>Video Source</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload Video File</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              className="hidden"
                              id="video-upload"
                            />
                            <Label htmlFor="video-upload" className="cursor-pointer">
                              <Button type="button" variant="outline" className="w-full">
                                <FileVideo className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                            </Label>
                            {uploadVideoMutation.isPending && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                              </div>
                            )}
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="text-center">
                            <Youtube className="w-8 h-8 mx-auto mb-2 text-red-600" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">YouTube URL</p>
                            <FormField
                              control={form.control}
                              name="videoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      placeholder="https://youtube.com/watch?v=..."
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="10:30 or 630 (seconds)"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
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
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="comedy">Comedy</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                                <SelectItem value="dance">Dance</SelectItem>
                                <SelectItem value="drama">Drama</SelectItem>
                                <SelectItem value="action">Action</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="documentary">Documentary</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quality</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select quality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="480p">480p</SelectItem>
                                <SelectItem value="720p">720p HD</SelectItem>
                                <SelectItem value="1080p">1080p Full HD</SelectItem>
                                <SelectItem value="4k">4K Ultra HD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="thumbnailUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thumbnail URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/thumbnail.jpg"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma separated)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="entertainment, comedy, viral, trending"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isVertical"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Vertical Video</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable for mobile-first vertical content
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {editingVideo ? "Update" : "Add"} Video
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading videos...
                    </TableCell>
                  </TableRow>
                ) : videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No videos found. Add your first video to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {video.thumbnailUrl && (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-16 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium line-clamp-1">{video.title}</h4>
                            {video.titleHindi && (
                              <p className="text-sm text-gray-500 line-clamp-1">{video.titleHindi}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {video.isVertical && (
                                <Badge variant="outline" className="text-xs">Vertical</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{video.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{video.quality}</Badge>
                      </TableCell>
                      <TableCell>{getVisibilityBadge(video.visibility)}</TableCell>
                      <TableCell>{(video.viewCount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(video)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/videos?v=${video.id}`, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteVideoMutation.mutate(video.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}