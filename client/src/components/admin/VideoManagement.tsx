import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Play, Clock, Upload } from "lucide-react";
import { format } from "date-fns";
import type { Video } from "@/../../shared/schema";

export default function VideoManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/admin/videos"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/videos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      setShowDialog(false);
      setEditingVideo(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/videos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      setShowDialog(false);
      setEditingVideo(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/videos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
    },
  });

  const filteredVideos = videos.filter((video: Video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.titleHindi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get("title") as string,
      titleHindi: formData.get("titleHindi") as string,
      description: formData.get("description") as string,
      videoUrl: formData.get("videoUrl") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      duration: formData.get("duration") as string,
      tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()),
      visibility: formData.get("visibility") as string,
      isVertical: formData.get("isVertical") === "true",
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this video?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Upload New Video"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title (English)</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingVideo?.title}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="titleHindi">Title (Hindi)</Label>
                  <Input
                    id="titleHindi"
                    name="titleHindi"
                    defaultValue={editingVideo?.titleHindi}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingVideo?.description || ""}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  defaultValue={editingVideo?.videoUrl}
                  placeholder="https://example.com/video.mp4"
                  required
                />
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  type="url"
                  defaultValue={editingVideo?.thumbnailUrl || ""}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (MM:SS)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    defaultValue={editingVideo?.duration || ""}
                    placeholder="05:30"
                  />
                </div>
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select name="visibility" defaultValue={editingVideo?.visibility || "public"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingVideo?.tags?.join(", ") || ""}
                  placeholder="entertainment, news, sports"
                />
              </div>

              <div>
                <Label htmlFor="isVertical">Video Orientation</Label>
                <Select name="isVertical" defaultValue={editingVideo?.isVertical ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Landscape (16:9)</SelectItem>
                    <SelectItem value="true">Portrait (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingVideo(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingVideo ? "Update" : "Upload"} Video
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video: Video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant={video.visibility === "public" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {video.visibility}
                    </Badge>
                    {video.isVertical && (
                      <Badge variant="outline" className="text-xs">
                        Vertical
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {video.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {video.duration || "Unknown"}
                    <span>•</span>
                    {video.viewCount || 0} views
                  </div>
                  {video.publishedAt && (
                    <div className="text-xs text-gray-400">
                      {format(new Date(video.publishedAt), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.videoUrl, '_blank')}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Watch
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(video)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredVideos.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No videos found</p>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload First Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}