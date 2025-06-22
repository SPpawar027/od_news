import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  FileText, 
  Video, 
  Tv, 
  Rss, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  Bot,
  Shield
} from "lucide-react";
import logoPath from "@assets/LOGO_1750507001018.png";

interface DashboardStats {
  articles: number;
  videos: number;
  users: number;
  rssFeeds: number;
}

interface Article {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  createdBy: number;
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
}

export default function AdminDashboard() {
  const { admin, logout, isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/admin/articles"],
    enabled: isAuthenticated && activeTab === "cms",
  });

  const { data: users } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && activeTab === "users" && admin?.role === "manager",
  });

  if (!isAuthenticated) {
    window.location.href = "/admin/login";
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager": return "bg-red-500";
      case "editor": return "bg-blue-500";
      case "limited_editor": return "bg-yellow-500";
      case "subtitle_editor": return "bg-green-500";
      case "viewer": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const canAccess = (requiredRoles: string[]) => {
    return admin && requiredRoles.includes(admin.role);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoPath} alt="Admin Panel" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={`${getRoleBadgeColor(admin?.role || "")} text-white`}>
              {admin?.role?.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {admin?.name}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logout()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            {canAccess(["manager", "editor", "limited_editor"]) && (
              <Button
                variant={activeTab === "cms" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("cms")}
              >
                <FileText className="h-4 w-4 mr-2" />
                CMS & Articles
              </Button>
            )}

            {canAccess(["manager", "editor"]) && (
              <Button
                variant={activeTab === "videos" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("videos")}
              >
                <Video className="h-4 w-4 mr-2" />
                Video Management
              </Button>
            )}

            {canAccess(["manager", "editor"]) && (
              <Button
                variant={activeTab === "live-tv" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("live-tv")}
              >
                <Tv className="h-4 w-4 mr-2" />
                Live TV Streams
              </Button>
            )}

            {canAccess(["manager", "editor"]) && (
              <Button
                variant={activeTab === "rss" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("rss")}
              >
                <Rss className="h-4 w-4 mr-2" />
                RSS Feeds
              </Button>
            )}

            {canAccess(["manager", "editor", "subtitle_editor"]) && (
              <Button
                variant={activeTab === "subtitles" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("subtitles")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Subtitles
              </Button>
            )}

            {canAccess(["manager"]) && (
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Dashboard Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome back, {admin?.name}! Here's your content overview.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.articles || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Published content
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Videos</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.videos || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Video content
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RSS Feeds</CardTitle>
                    <Rss className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.rssFeeds || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active feeds
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      System users
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Role Permissions Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Your Role Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {admin?.role === "manager" && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ✓ Full system access • Create/Edit/Delete articles • Manage users • Revenue data access
                      </div>
                    )}
                    {admin?.role === "editor" && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        ✓ Create and edit articles • Manage videos • Live TV streams • RSS feeds
                      </div>
                    )}
                    {admin?.role === "limited_editor" && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        ✓ Create and edit articles • No access to revenue data or user management
                      </div>
                    )}
                    {admin?.role === "subtitle_editor" && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ✓ Manage video subtitles only • Upload and edit VTT files
                      </div>
                    )}
                    {admin?.role === "viewer" && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ✓ Read-only access to all content • No editing permissions
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "cms" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Content Management System
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create and manage articles with AI enhancement tools
                  </p>
                </div>
                {canAccess(["manager", "editor", "limited_editor"]) && (
                  <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI Enhance
                    </Button>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Article
                    </Button>
                  </div>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                  <CardDescription>
                    Manage your published and draft content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles?.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{article.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={article.status === "published" ? "default" : "secondary"}>
                              {article.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canAccess(["manager", "editor", "limited_editor"]) && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canAccess(["manager"]) && (
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && canAccess(["manager"]) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    User Management
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage admin users and their roles
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>
                    Manage user access levels and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                              {user.role.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add other tab content as needed */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Video Management
                </h2>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Video
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-gray-500">
                    Video management interface with HLS.js support coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}