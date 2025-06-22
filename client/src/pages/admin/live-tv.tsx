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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Edit, Trash2, Tv, Radio, Globe } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface LiveTv {
  id: number;
  channelName: string;
  channelNameHindi: string;
  streamUrl: string;
  logoUrl: string | null;
  description: string | null;
  descriptionHindi: string | null;
  quality: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

const liveTvSchema = z.object({
  channelName: z.string().min(1, "Channel name is required"),
  channelNameHindi: z.string().min(1, "Hindi channel name is required"),
  streamUrl: z.string().url("Valid stream URL is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  descriptionHindi: z.string().optional(),
  quality: z.string().optional(),
  isActive: z.boolean().default(true),
});

type LiveTvFormData = z.infer<typeof liveTvSchema>;

export default function AdminLiveTv() {
  const { user, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const [editingChannel, setEditingChannel] = useState<LiveTv | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<LiveTvFormData>({
    resolver: zodResolver(liveTvSchema),
    defaultValues: {
      channelName: "",
      channelNameHindi: "",
      streamUrl: "",
      logoUrl: "",
      description: "",
      descriptionHindi: "",
      quality: "",
      isActive: true,
    },
  });

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/admin/live-tv"],
    enabled: isAuthenticated,
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: LiveTvFormData) => {
      const response = await fetch("/api/admin/live-tv", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-tv"] });
      toast({ title: "Success", description: "Live TV channel created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create channel", variant: "destructive" });
    },
  });

  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LiveTvFormData }) => {
      const response = await fetch(`/api/admin/live-tv/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-tv"] });
      toast({ title: "Success", description: "Live TV channel updated successfully" });
      setIsDialogOpen(false);
      setEditingChannel(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update channel", variant: "destructive" });
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/live-tv/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete channel");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-tv"] });
      toast({ title: "Success", description: "Live TV channel deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete channel", variant: "destructive" });
    },
  });

  const handleCreateChannel = (data: LiveTvFormData) => {
    createChannelMutation.mutate(data);
  };

  const handleUpdateChannel = (data: LiveTvFormData) => {
    if (editingChannel) {
      updateChannelMutation.mutate({ id: editingChannel.id, data });
    }
  };

  const handleEditChannel = (channel: LiveTv) => {
    setEditingChannel(channel);
    form.reset({
      channelName: channel.channelName,
      channelNameHindi: channel.channelNameHindi,
      streamUrl: channel.streamUrl,
      logoUrl: channel.logoUrl || "",
      description: channel.description || "",
      descriptionHindi: channel.descriptionHindi || "",
      quality: channel.quality || "",
      isActive: channel.isActive || true,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteChannel = (id: number) => {
    if (confirm("Are you sure you want to delete this live TV channel?")) {
      deleteChannelMutation.mutate(id);
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
                <span className="text-gray-900 font-medium">Live TV</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Live TV Management</h1>
            <p className="mt-2 text-gray-600">Manage live television channels and streams</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingChannel(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChannel ? "Edit Live TV Channel" : "Create Live TV Channel"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(editingChannel ? handleUpdateChannel : handleCreateChannel)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="channelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Name (English)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., OD News Live" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="channelNameHindi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Channel Name (Hindi)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., ओडी न्यूज़ लाइव" />
                          </FormControl>
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
                        <FormLabel>Stream URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://stream.example.com/live" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quality (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 1080p, 720p" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 pt-6">
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
                    <Button type="submit" disabled={createChannelMutation.isPending || updateChannelMutation.isPending}>
                      {editingChannel ? "Update" : "Create"} Channel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Channels List */}
        <div className="grid gap-6">
          {channelsLoading ? (
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
          ) : channels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No live TV channels</h3>
                <p className="text-gray-600 mb-4">Start by adding your first live TV channel</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Radio className="w-4 h-4 mr-2" />
                  Add Channel
                </Button>
              </CardContent>
            </Card>
          ) : (
            channels.map((channel: LiveTv) => (
              <Card key={channel.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{channel.channelName}</h3>
                        {channel.isActive ? (
                          <Badge className="bg-red-100 text-red-800">LIVE</Badge>
                        ) : (
                          <Badge variant="secondary">Offline</Badge>
                        )}
                        {channel.quality && (
                          <Badge variant="outline">{channel.quality}</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{channel.channelNameHindi}</p>
                      {channel.description && (
                        <p className="text-sm text-gray-500 mb-4">{channel.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          Stream URL: {channel.streamUrl.substring(0, 50)}...
                        </span>
                        <span>Created: {new Date(channel.createdAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChannel(channel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
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