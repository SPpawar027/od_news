import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Radio, 
  Rss, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Tags,
  Shield,
  Zap,
  Image
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  {
    name: "Content Management",
    href: "/admin/articles",
    icon: FileText,
    description: "Articles & News",
    badge: "CMS"
  },
  {
    name: "Live TV",
    href: "/admin/live-tv",
    icon: Radio,
    description: "Stream Management",
    badge: "LIVE"
  },
  {
    name: "Videos",
    href: "/admin/videos",
    icon: Video,
    description: "Entertainment Section"
  },
  {
    name: "Breaking News",
    href: "/admin/breaking-news",
    icon: Zap,
    description: "Breaking News Ticker",
    badge: "URGENT"
  },
  {
    name: "RSS Feeds",
    href: "/admin/rss",
    icon: Rss,
    description: "Auto Import Sources"
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Performance Metrics"
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
    description: "Content Categories"
  },
  {
    name: "Advertisements",
    href: "/admin/ads",
    icon: Image,
    description: "Google Ads & Banners",
    badge: "ADS"
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Admin Users & Roles"
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System Configuration"
  }
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">OD News</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto p-3",
                  collapsed && "justify-center p-3",
                  isActive && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", collapsed && "w-6 h-6")} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-1">{item.description}</p>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950",
            collapsed && "justify-center"
          )}
          onClick={() => {
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}