import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Users, 
  FileText, 
  Video, 
  Radio, 
  Rss, 
  Settings, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Menu,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Play,
  PauseCircle,
  Upload,
  Download,
  Sparkles,
  Hash,
  Clock,
  Calendar
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalArticles: number;
  totalVideos: number;
  totalStreams: number;
  totalRssFeeds: number;
  totalUsers: number;
  recentArticles: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

interface Article {
  id: number;
  title: string;
  titleHindi: string;
  content: string;
  contentHindi: string;
  excerpt: string;
  excerptHindi: string;
  imageUrl?: string;
  authorName?: string;
  categoryId?: number;
  isBreaking: boolean;
  isTrending: boolean;
  status: string;
  hashtags?: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface LiveStream {
  id: number;
  name: string;
  nameHindi: string;
  streamType: string;
  streamUrl: string;
  thumbnailUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  viewerCount: number;
}

interface RssFeed {
  id: number;
  name: string;
  url: string;
  categoryId?: number;
  isActive: boolean;
  lastFetched?: string;
  fetchFrequency: number;
  itemCount: number;
}

interface Video {
  id: number;
  title: string;
  titleHindi: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  tags?: string[];
  categoryId?: number;
  isVertical: boolean;
  viewCount: number;
  revenue?: number;
}

export default function AdminDashboard() {
  const { admin, logout, isAuthenticated, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  if (!isLoading && !isAuthenticated) {
    window.location.href = "/admin/login";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Dashboard Statistics
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/v1/admin/stats"],
    enabled: isAuthenticated && activeTab === "dashboard",
  });

  // Articles Management
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/v1/admin/articles"],
    enabled: isAuthenticated && activeTab === "cms",
  });

  // Live Streams Management
  const { data: streams = [] } = useQuery<LiveStream[]>({
    queryKey: ["/api/v1/admin/streams"],
    enabled: isAuthenticated && activeTab === "live-tv",
  });

  // RSS Feeds Management
  const { data: rssFeeds = [] } = useQuery<RssFeed[]>({
    queryKey: ["/api/v1/admin/rss-feeds"],
    enabled: isAuthenticated && activeTab === "rss",
  });

  // Videos Management
  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ["/api/v1/admin/videos"],
    enabled: isAuthenticated && activeTab === "videos",
  });

  // User Management (Manager only)
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/v1/admin/users"],
    enabled: isAuthenticated && activeTab === "users" && admin?.role === "manager",
  });

  // Global search
  const { data: searchResults } = useQuery({
    queryKey: ["/api/v1/admin/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const getRoleColor = (role: string) => {
    const colors = {
      manager: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      editor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      limited_editor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      subtitle_editor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const canAccess = (requiredRoles: string[]) => {
    return admin && requiredRoles.includes(admin.role);
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["manager", "editor", "limited_editor", "subtitle_editor", "viewer"] },
    { id: "cms", label: "Content Management", icon: FileText, roles: ["manager", "editor", "limited_editor"] },
    { id: "live-tv", label: "Live TV Management", icon: Radio, roles: ["manager", "editor"] },
    { id: "rss", label: "RSS Feeds", icon: Rss, roles: ["manager", "editor"] },
    { id: "videos", label: "Video Management", icon: Video, roles: ["manager", "editor", "limited_editor", "subtitle_editor"] },
    { id: "users", label: "User Management", icon: Users, roles: ["manager"] }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Justice Wave</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          if (!canAccess(item.roles)) return null;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-red-100 text-red-600">
              {admin?.name?.charAt(0) || admin?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {admin?.name || admin?.username}
            </p>
            <Badge className={`text-xs ${getRoleColor(admin?.role || "viewer")}`}>
              {admin?.role?.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search Bar */}
              <div className="relative w-96 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles, videos, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {admin?.name?.charAt(0) || admin?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{admin?.name || admin?.username}</p>
                      <p className="text-xs text-gray-500">{admin?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <span className="mr-2 h-4 w-4">🚪</span>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Actions
                </Button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Live Streams</CardTitle>
                    <Radio className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStreams || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      2 currently active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Videos</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RSS Feeds</CardTitle>
                    <Rss className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalRssFeeds || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Auto-fetching enabled
                    </p>
                  </CardContent>
                </Card>

                {admin?.role === "manager" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        5 roles configured
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Articles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats?.recentArticles?.map((article) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium truncate">{article.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={article.status === "published" ? "default" : "secondary"}>
                          {article.status}
                        </Badge>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center">No recent articles</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>RSS Auto-fetch</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Live Streams</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Services</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CMS Tab */}
            <TabsContent value="cms" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Content Management System</h1>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Enhance
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {articles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{article.titleHindi}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={article.status === "published" ? "default" : "secondary"}>
                            {article.status}
                          </Badge>
                          {article.isBreaking && (
                            <Badge className="bg-red-100 text-red-800">Breaking</Badge>
                          )}
                          {article.isTrending && (
                            <Badge className="bg-blue-100 text-blue-800">Trending</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>v{article.version}</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          {article.hashtags && (
                            <div className="flex items-center space-x-1">
                              <Hash className="w-3 h-3" />
                              <span>{article.hashtags.join(", ")}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          {canAccess(["manager", "editor"]) && (
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Live TV Tab */}
            <TabsContent value="live-tv" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Live TV Management</h1>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stream
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((stream) => (
                  <Card key={stream.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{stream.name}</CardTitle>
                        <Switch checked={stream.isActive} />
                      </div>
                      <p className="text-sm text-gray-500">{stream.nameHindi}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                        {stream.isActive ? (
                          <Play className="w-8 h-8 text-green-600" />
                        ) : (
                          <PauseCircle className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Type:</span>
                          <Badge variant="outline">{stream.streamType.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Viewers:</span>
                          <span className="font-medium">{stream.viewerCount.toLocaleString()}</span>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* RSS Tab */}
            <TabsContent value="rss" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">RSS Feed Management</h1>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add RSS Feed
                </Button>
              </div>

              <div className="grid gap-6">
                {rssFeeds.map((feed) => (
                  <Card key={feed.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{feed.name}</CardTitle>
                          <p className="text-sm text-gray-500">{feed.url}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch checked={feed.isActive} />
                          <Badge variant={feed.isActive ? "default" : "secondary"}>
                            {feed.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Items:</span>
                          <p className="font-medium">{feed.itemCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <p className="font-medium">{feed.fetchFrequency} min</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Fetch:</span>
                          <p className="font-medium">
                            {feed.lastFetched 
                              ? new Date(feed.lastFetched).toLocaleDateString() 
                              : "Never"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Fetch Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Items
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Video Management</h1>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <Card key={video.id}>
                    <CardHeader>
                      <CardTitle className="text-lg truncate">{video.title}</CardTitle>
                      <p className="text-sm text-gray-500 truncate">{video.titleHindi}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Views:</span>
                          <span className="font-medium">{video.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Format:</span>
                          <Badge variant="outline">
                            {video.isVertical ? "Vertical" : "Horizontal"}
                          </Badge>
                        </div>
                        {canAccess(["manager", "editor"]) && video.revenue !== undefined && (
                          <div className="flex items-center justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium text-green-600">₹{video.revenue}</span>
                          </div>
                        )}
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          {canAccess(["manager", "editor", "subtitle_editor"]) && (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="w-3 h-3 mr-1" />
                              Subtitles
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Users Tab (Manager Only) */}
            {admin?.role === "manager" && (
              <TabsContent value="users" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">User Management</h1>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <div className="grid gap-6">
                  {users.map((user: any) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-gray-100">
                                {user.name?.charAt(0) || user.username?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{user.name || user.username}</CardTitle>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Switch checked={user.isActive} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-500">Last Login:</span>
                            <p className="font-medium">
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString() 
                                : "Never"
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-3 h-3 mr-1" />
                              Permissions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
}