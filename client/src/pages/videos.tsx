import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Eye, Clock, Search, Filter, TrendingUp, Calendar } from "lucide-react";
import Header from "@/components/Header";

interface Video {
  id: number;
  title: string;
  titleHindi: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  uploadDate: string;
  category: string;
  isVertical: boolean;
  tags: string[];
}

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock videos data
  const videos: Video[] = [
    {
      id: 1,
      title: "Parliament Session Highlights",
      titleHindi: "संसद सत्र की मुख्य बातें",
      description: "Key highlights from today's parliament session with major policy discussions",
      thumbnailUrl: "https://images.unsplash.com/photo-1586765669224-68c13bc1ba04?w=400&h=250&fit=crop",
      duration: "15:30",
      viewCount: 125000,
      uploadDate: "2 hours ago",
      category: "Politics",
      isVertical: false,
      tags: ["Parliament", "Politics", "News"]
    },
    {
      id: 2,
      title: "Cricket World Cup Final Analysis",
      titleHindi: "क्रिकेट विश्व कप फाइनल विश्लेषण",
      description: "Expert analysis of the thrilling cricket world cup final match",
      thumbnailUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop",
      duration: "12:45",
      viewCount: 89000,
      uploadDate: "5 hours ago",
      category: "Sports",
      isVertical: false,
      tags: ["Cricket", "Sports", "Analysis"]
    },
    {
      id: 3,
      title: "Bollywood Breaking News",
      titleHindi: "बॉलीवुड ब्रेकिंग न्यूज़",
      description: "Latest updates from the entertainment industry",
      thumbnailUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=250&fit=crop",
      duration: "8:20",
      viewCount: 67000,
      uploadDate: "1 day ago",
      category: "Entertainment",
      isVertical: true,
      tags: ["Bollywood", "Entertainment", "Celebrity"]
    },
    {
      id: 4,
      title: "Economic Policy Changes",
      titleHindi: "आर्थिक नीति परिवर्तन",
      description: "Understanding the new economic reforms and their impact",
      thumbnailUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop",
      duration: "18:15",
      viewCount: 45000,
      uploadDate: "2 days ago",
      category: "Business",
      isVertical: false,
      tags: ["Economy", "Policy", "Business"]
    },
    {
      id: 5,
      title: "Tech Innovation Showcase",
      titleHindi: "तकनीकी नवाचार प्रदर्शनी",
      description: "Latest technological innovations and startups",
      thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop",
      duration: "22:10",
      viewCount: 112000,
      uploadDate: "3 days ago",
      category: "Technology",
      isVertical: false,
      tags: ["Technology", "Innovation", "Startup"]
    },
    {
      id: 6,
      title: "Breaking: Market Update",
      titleHindi: "ब्रेकिंग: बाज़ार अपडेट",
      description: "Live market updates and stock analysis",
      thumbnailUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      duration: "6:45",
      viewCount: 78000,
      uploadDate: "4 hours ago",
      category: "Business",
      isVertical: true,
      tags: ["Markets", "Stocks", "Finance"]
    }
  ];

  const categories = ["all", "Politics", "Sports", "Entertainment", "Business", "Technology"];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.titleHindi.includes(searchQuery) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingVideos = videos.filter(video => video.viewCount > 80000);
  const recentVideos = videos.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Videos
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            Watch latest news videos and exclusive content
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            नवीनतम समाचार वीडियो और विशेष सामग्री देखें
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search videos... वीडियो खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              All Videos
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                      <Button
                        size="lg"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    {video.isVertical && (
                      <Badge className="absolute top-2 left-2 bg-purple-600">
                        Shorts
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      {video.titleHindi}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.viewCount.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.uploadDate}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingVideos.map((video) => (
                <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                      <Button
                        size="lg"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse">
                      🔥 Trending
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      {video.titleHindi}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.viewCount.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.uploadDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentVideos.map((video) => (
                <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                      <Button
                        size="lg"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <Badge className="absolute top-2 left-2 bg-green-600">
                      New
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      {video.titleHindi}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.viewCount.toLocaleString()} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.uploadDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}