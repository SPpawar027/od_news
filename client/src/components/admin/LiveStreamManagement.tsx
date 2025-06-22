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
  Pause,
  Radio,
  Eye,
  Users,
  Tv,
  Youtube,
  Globe,
  Signal,
  SignalHigh,
  SignalLow
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LiveStream, InsertLiveStream } from "@shared/schema";

const streamSchema = z.object({
  name: z.string().min(1, "Stream name is required"),
  nameHindi: z.string().optional(),
  description: z.string().optional(),
  streamUrl: z.string().url("Valid stream URL is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  streamType: z.enum(["m3u8", "youtube", "custom"]),
  category: z.string().min(1, "Category is required"),
  quality: z.enum(["480p", "720p", "1080p", "4k"]),
  isActive: z.boolean().default(true),
});

type StreamFormData = z.infer<typeof streamSchema>;

export default function LiveStreamManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StreamFormData>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      name: "",
      nameHindi: "",
      description: "",
      streamUrl: "",
      thumbnailUrl: "",
      streamType: "m3u8",
      category: "news",
      quality: "720p",
      isActive: true,
    },
  });

  const { data: streams = [], isLoading } = useQuery<LiveStream[]>({
    queryKey: ["/api/admin/live-streams"],
    queryFn: async () => {
      const response = await fetch("/api/admin/live-streams", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch streams");
      return response.json();
    },
  });

  const createStreamMutation = useMutation({
    mutationFn: async (data: StreamFormData) => {
      const response = await fetch("/api/admin/live-streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Live stream created successfully",
      });
    },
  });

  const updateStreamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StreamFormData> }) => {
      const response = await fetch(`/api/admin/live-streams/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      setEditingStream(null);
      toast({
        title: "Live stream updated successfully",
      });
    },
  });

  const deleteStreamMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/live-streams/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete stream");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      toast({
        title: "Live stream deleted successfully",
      });
    },
  });

  const toggleStreamMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/live-streams/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
    },
  });

  const handleEdit = (stream: LiveStream) => {
    setEditingStream(stream);
    form.reset({
      name: stream.name,
      nameHindi: stream.nameHindi || "",
      description: stream.description || "",
      streamUrl: stream.streamUrl,
      thumbnailUrl: stream.thumbnailUrl || "",
      streamType: stream.streamType as "m3u8" | "youtube" | "custom",
      category: stream.category,
      quality: stream.quality as "480p" | "720p" | "1080p" | "4k",
      isActive: stream.isActive,
    });
    setShowAddDialog(true);
  };

  const handleSave = (data: StreamFormData) => {
    if (editingStream) {
      updateStreamMutation.mutate({ id: editingStream.id, data });
    } else {
      createStreamMutation.mutate(data);
    }
  };

  const getStreamTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-600" />;
      case "m3u8":
        return <Radio className="w-4 h-4 text-blue-600" />;
      default:
        return <Globe className="w-4 h-4 text-green-600" />;
    }
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      "480p": "bg-gray-500",
      "720p": "bg-blue-500",
      "1080p": "bg-green-500",
      "4k": "bg-purple-500"
    };
    return (
      <Badge className={`${colors[quality as keyof typeof colors]} text-white`}>
        {quality}
      </Badge>
    );
  };

  const stats = {
    total: streams.length,
    active: streams.filter(s => s.isActive).length,
    inactive: streams.filter(s => !s.isActive).length,
    totalViewers: streams.reduce((sum, s) => sum + (s.viewerCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Streams</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <SignalHigh className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <SignalLow className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Viewers</p>
                <p className="text-xl font-bold">{stats.totalViewers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stream Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live TV Stream Management</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingStream(null);
                    form.reset();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stream
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingStream ? "Edit Live Stream" : "Add New Live Stream"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stream Name (English) *</FormLabel>
                            <FormControl>
                              <Input placeholder="DD News" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameHindi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stream Name (Hindi)</FormLabel>
                            <FormControl>
                              <Input placeholder="डीडी न्यूज़" {...field} />
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
                              placeholder="Live news channel providing 24/7 coverage..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="streamType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stream Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stream type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="m3u8">M3U8/HLS</SelectItem>
                                <SelectItem value="youtube">YouTube Live</SelectItem>
                                <SelectItem value="custom">Custom/RTMP</SelectItem>
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

                    <FormField
                      control={form.control}
                      name="streamUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream URL *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/stream.m3u8 or YouTube URL"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="entertainment">Entertainment</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="movies">Movies</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Stream</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable this stream for viewers
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
                        disabled={createStreamMutation.isPending || updateStreamMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {editingStream ? "Update" : "Create"} Stream
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
                  <TableHead>Stream</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Viewers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading streams...
                    </TableCell>
                  </TableRow>
                ) : streams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No live streams found. Add your first stream to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  streams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {stream.thumbnailUrl && (
                            <img
                              src={stream.thumbnailUrl}
                              alt={stream.name}
                              className="w-12 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{stream.name}</h4>
                            {stream.nameHindi && (
                              <p className="text-sm text-gray-500">{stream.nameHindi}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStreamTypeIcon(stream.streamType)}
                          <span className="capitalize">{stream.streamType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getQualityBadge(stream.quality)}</TableCell>
                      <TableCell className="capitalize">{stream.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            stream.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span>{stream.isActive ? 'Live' : 'Offline'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{stream.viewerCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStreamMutation.mutate({
                              id: stream.id,
                              isActive: stream.isActive
                            })}
                          >
                            {stream.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(stream)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/live-tv?stream=${stream.id}`, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteStreamMutation.mutate(stream.id)}
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