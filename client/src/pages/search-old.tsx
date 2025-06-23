import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, TrendingUp, Filter, Calendar, Eye } from "lucide-react";
import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import { LAYOUT_CONFIG } from "@/lib/constants";
import type { Article, Category } from "@shared/schema";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: trendingArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/trending-articles"],
  });

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() && articles.length > 0) {
      const filtered = articles.filter(article => {
        const matchesQuery = 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (article.titleHindi && article.titleHindi.includes(searchQuery)) ||
          (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (article.contentHindi && article.contentHindi.includes(searchQuery)) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (article.excerptHindi && article.excerptHindi.includes(searchQuery));

        const matchesFilter = activeFilter === "all" || 
          (activeFilter === "breaking" && article.isBreaking) ||
          (activeFilter === "trending" && article.isTrending) ||
          (categories.find(cat => cat.id === article.categoryId)?.title.toLowerCase() === activeFilter.toLowerCase());

        return matchesQuery && matchesFilter;
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeFilter, articles, categories]);

  const recentSearches = [
    "Parliament session",
    "Cricket world cup", 
    "Bollywood news",
    "Economic reforms",
    "Technology updates"
  ];

  const trendingSearches = [
    "Breaking news",
    "Live updates",
    "Sports highlights",
    "Political developments",
    "Market analysis"
  ];

  const getCategoryName = (categoryId: number | null) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : "General";
  };

  const getCategoryColor = (categoryId: number | null) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : "#6b7280";
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "अभी";
    if (diffInHours < 24) return `${diffInHours} घंटे पहले`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} दिन पहले`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <SEOHead 
        title="Search - OD News | समाचार खोजें"
        description="OD News पर समाचार, लेख और वीडियो खोजें। ताजा खबरों और जानकारी के लिए हमारा सर्च इंजन का उपयोग करें।"
        keywords="समाचार खोजें, न्यूज़ सर्च, OD News खोज, हिंदी समाचार खोजें"
      />
      <Header />

      {/* Main Content Container with Fixed Sidebars */}
      <div className="relative">
        <div className="mx-auto px-4 py-6 pb-20 lg:pb-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="flex gap-6">
            {/* Fixed Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <LeftSidebar />
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 lg:flex lg:gap-6">
              <div className="flex-1">
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      Search
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                      Find news articles, videos, and more
                    </p>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                      समाचार लेख, वीडियो और अधिक खोजें
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Search news, articles, videos... समाचार, लेख, वीडियो खोजें..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 py-4 text-lg rounded-xl border-2 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {searchQuery ? (
                    <div className="space-y-6">
                      {/* Search Filters */}
                      <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                All Results
              </Button>
              <Button
                variant={activeFilter === "breaking" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("breaking")}
              >
                Breaking News
              </Button>
              <Button
                variant={activeFilter === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("trending")}
              >
                Trending
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeFilter === category.title.toLowerCase() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(category.title.toLowerCase())}
                >
                  {category.title}
                </Button>
              ))}
            </div>

            {/* Search Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Search Results ({searchResults.length})
                </h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid gap-6">
                  {searchResults.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex gap-4 p-6">
                        {article.imageUrl && (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold line-clamp-2 mb-1">
                                {article.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-1 mb-2">
                                {article.titleHindi}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {article.isBreaking && (
                                <Badge className="bg-red-600 text-white animate-pulse">
                                  Breaking
                                </Badge>
                              )}
                              {article.isTrending && (
                                <Badge className="bg-orange-600 text-white">
                                  Trending
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
                            {article.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <div className="flex items-center gap-4">
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: getCategoryColor(article.categoryId) }}
                              >
                                {getCategoryName(article.categoryId)}
                              </Badge>
                              {article.authorName && (
                                <span>By {article.authorName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(article.createdAt || new Date())}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="text-slate-400 mb-4">
                    <Search className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p>Try different keywords or browse our categories</p>
                    <p className="text-sm mt-1">कोई परिणाम नहीं मिला, अलग शब्दों का प्रयास करें</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="trending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center">Trending Searches</h2>
                <div className="grid gap-4">
                  {trendingSearches.map((search, index) => (
                    <Card 
                      key={search} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSearchQuery(search)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                            <TrendingUp className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium">{search}</span>
                          <Badge variant="outline" className="ml-auto">
                            #{index + 1}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Trending Articles */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Trending Articles</h3>
                  <div className="grid gap-4">
                    {trendingArticles.slice(0, 3).map((article) => (
                      <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {article.imageUrl && (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-16 h-12 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold line-clamp-2 mb-1">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryName(article.categoryId)}
                                </Badge>
                                <span>{formatTimeAgo(article.createdAt || new Date())}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center">Recent Searches</h2>
                <div className="grid gap-4">
                  {recentSearches.map((search, index) => (
                    <Card 
                      key={search} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSearchQuery(search)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{search}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Popular Categories */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Browse Categories</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <Card 
                        key={category.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setActiveFilter(category.title.toLowerCase())}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <h4 className="font-semibold">{category.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {category.titleHindi}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
              </div>
              
              {/* Fixed Right Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}