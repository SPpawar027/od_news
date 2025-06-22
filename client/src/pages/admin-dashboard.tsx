import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Video, 
  Radio, 
  Rss, 
  TrendingUp, 
  Eye,
  MessageSquare,
  Calendar,
  Bell,
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Pause
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import type { Article, LiveStream, Video as VideoType, AdminUser, RssSource } from "@shared/schema";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
  });

  const { data: liveStreams = [] } = useQuery<LiveStream[]>({
    queryKey: ["/api/admin/live-streams"],
  });

  const { data: videos = [] } = useQuery<VideoType[]>({
    queryKey: ["/api/admin/videos"],
  });

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: rssFeeds = [] } = useQuery<RssSource[]>({
    queryKey: ["/api/admin/rss-sources"],
  });

  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.publishedAt).length,
    draftArticles: articles.filter(a => !a.publishedAt).length,
    totalVideos: videos.length,
    totalStreams: liveStreams.length,
    activeStreams: liveStreams.filter(s => s.isActive).length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalRssFeeds: rssFeeds.length,
    activeRssFeeds: rssFeeds.filter(r => r.isActive).length,
  };

  const recentArticles = articles.slice(0, 5);
  const recentVideos = videos.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to OD News Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your news platform content, users, and settings
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Articles
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalArticles}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stats.publishedArticles} Published
                    </Badge>
                    <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                      {stats.draftArticles} Drafts
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Live Streams
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalStreams}
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                      <Radio className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {stats.activeStreams} Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Videos
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalVideos}
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                      <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>Entertainment Section</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        RSS Feeds
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalRssFeeds}
                      </p>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                      <Rss className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{stats.activeRssFeeds} Active Sources</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-fit">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="streams">Live TV</TabsTrigger>
                <TabsTrigger value="rss">RSS Feeds</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Articles */}
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Recent Articles</CardTitle>
                        <CardDescription>Latest published content</CardDescription>
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        New Article
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentArticles.map((article) => (
                        <div key={article.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          {article.imageUrl && (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{article.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {article.authorName || "Unknown Author"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {article.isBreaking && (
                              <Badge className="bg-red-600 text-white">Breaking</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Videos */}
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Recent Videos</CardTitle>
                        <CardDescription>Latest entertainment content</CardDescription>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentVideos.map((video) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          {video.thumbnailUrl && (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{video.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>{video.duration}</span>
                              <span>•</span>
                              <span>{video.viewCount} views</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={video.visibility === "public" ? "default" : "secondary"}>
                              {video.visibility}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Live Streams Status */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Live Streams Status</CardTitle>
                    <CardDescription>Monitor your live TV channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {liveStreams.slice(0, 6).map((stream) => (
                        <div key={stream.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="relative">
                            {stream.thumbnailUrl && (
                              <img
                                src={stream.thumbnailUrl}
                                alt={stream.name}
                                className="w-16 h-12 rounded object-cover"
                              />
                            )}
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              stream.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{stream.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stream.viewerCount} viewers
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {stream.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="articles">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Content Management System</CardTitle>
                    <CardDescription>Manage news articles and content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Advanced article management interface will be implemented here with rich text editor, 
                      draft management, scheduling, and bulk operations.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="videos">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Video Management</CardTitle>
                    <CardDescription>Entertainment section video content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Video upload, subtitle management, and metadata editing interface will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="streams">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Live TV Management</CardTitle>
                    <CardDescription>Manage live streaming channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      Live stream configuration, M3U8 management, and real-time monitoring will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rss">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>RSS Feed Management</CardTitle>
                    <CardDescription>Auto-import content from RSS sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      RSS source management, auto-fetch configuration, and content import interface will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}