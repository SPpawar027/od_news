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
import { Plus, Search, Edit, Trash2, Play, Pause, Users } from "lucide-react";
import type { LiveStream } from "@/../../shared/schema";

export default function LiveStreamManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["/api/admin/live-streams"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/live-streams", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      setShowDialog(false);
      setEditingStream(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/live-streams/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      setShowDialog(false);
      setEditingStream(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/live-streams/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
    },
  });

  const toggleStreamMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/live-streams/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
    },
  });

  const filteredStreams = streams.filter((stream: LiveStream) =>
    stream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stream.nameHindi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      nameHindi: formData.get("nameHindi") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      url: formData.get("url") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      category: formData.get("category") as string,
      isActive: formData.get("isActive") === "true",
    };

    if (editingStream) {
      updateMutation.mutate({ id: editingStream.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (stream: LiveStream) => {
    setEditingStream(stream);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this stream?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStream = (id: number, currentStatus: boolean | null) => {
    toggleStreamMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search streams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Stream
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStream ? "Edit Stream" : "Add New Stream"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Stream Name (English)</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingStream?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameHindi">Stream Name (Hindi)</Label>
                  <Input
                    id="nameHindi"
                    name="nameHindi"
                    defaultValue={editingStream?.nameHindi}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingStream?.description || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Stream Type</Label>
                  <Select name="type" defaultValue={editingStream?.type || "m3u8"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m3u8">M3U8 (HLS)</SelectItem>
                      <SelectItem value="youtube">YouTube Live</SelectItem>
                      <SelectItem value="rtmp">RTMP</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingStream?.category || "news"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">Stream URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={editingStream?.url}
                  placeholder="https://example.com/stream.m3u8"
                  required
                />
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  type="url"
                  defaultValue={editingStream?.thumbnailUrl || ""}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select name="isActive" defaultValue={editingStream?.isActive ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingStream(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingStream ? "Update" : "Create"} Stream
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Streams Grid */}
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
          {filteredStreams.map((stream: LiveStream) => (
            <Card key={stream.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {stream.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant={stream.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stream.isActive ? "Live" : "Offline"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {stream.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {stream.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-3 h-3" />
                    {stream.viewerCount || 0} viewers
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stream.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    variant={stream.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleStream(stream.id, stream.isActive)}
                  >
                    {stream.isActive ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(stream)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(stream.id)}
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

      {filteredStreams.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4">No live streams found</p>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Stream
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}