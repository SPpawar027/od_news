import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Video, 
  Layers3, 
  LogOut, 
  BarChart3, 
  Settings, 
  Plus,
  TrendingUp,
  Eye,
  Edit3,
  Tv,
  Rss,
  Hash
} from "lucide-react";

interface DashboardStats {
  articles: number;
  videos: number;
  categories: number;
  users: number;
}

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAdminAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    window.location.href = "/admin/login";
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MANAGER': return 'bg-red-100 text-red-800';
      case 'EDITOR': return 'bg-blue-100 text-blue-800';
      case 'LIMITED_EDITOR': return 'bg-yellow-100 text-yellow-800';
      case 'SUBTITLE_EDITOR': return 'bg-green-100 text-green-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissions = (role: string) => {
    switch (role) {
      case 'MANAGER': 
        return ['Full Access', 'User Management', 'Revenue Data', 'All Content'];
      case 'EDITOR': 
        return ['Content Management', 'Live TV', 'RSS Feeds', 'Videos', 'Revenue Data'];
      case 'LIMITED_EDITOR': 
        return ['Content Management', 'Videos', 'Basic Features'];
      case 'SUBTITLE_EDITOR': 
        return ['Subtitle Management', 'Video Access'];
      case 'VIEWER': 
        return ['View Only', 'Reports'];
      default: 
        return ['Limited Access'];
    }
  };

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
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h2>
          <p className="text-gray-600">
            Manage your OD News content and system with comprehensive admin tools.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin/articles'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.articles || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Click to manage articles
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin/videos'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.videos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Click to manage videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Layers3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.categories || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.users || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Role & Permissions</CardTitle>
            <CardDescription>
              Current access level and available features for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getPermissions(user.role).map((permission, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{permission}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Content Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage articles, breaking news, and editorial content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/articles'}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Article
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/breaking-news'}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Manage Breaking News
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Hash className="w-4 h-4 mr-2" />
                AI Content Enhancement
              </Button>
            </CardContent>
          </Card>

          {/* Media Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5" />
                <span>Media Management</span>
              </CardTitle>
              <CardDescription>
                Handle videos, live TV channels, and multimedia content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/videos'}>
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/live-tv'}>
                <Tv className="w-4 h-4 mr-2" />
                Manage Live TV
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/admin/rss-feeds'}>
                <Rss className="w-4 h-4 mr-2" />
                RSS Feed Management
              </Button>
            </CardContent>
          </Card>

          {/* System Management */}
          {user.role === 'MANAGER' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Management</span>
                </CardTitle>
                <CardDescription>
                  User management, system settings, and administrative tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics & Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}