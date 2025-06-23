import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, TrendingUp } from "lucide-react";
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Search functionality
  const searchResults = searchQuery.trim() 
    ? articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.titleHindi && article.titleHindi.includes(searchQuery)) ||
        (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const getCategoryName = (categoryId: number | null) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : "General";
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
                  <h1 className="text-4xl font-bold text-gray-800 mb-2 font-hindi">
                    समाचार खोजें
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    Find news articles, videos, and more
                  </p>
                  <p className="text-lg text-gray-600 font-hindi">
                    समाचार लेख, वीडियो और अधिक खोजें
                  </p>
                </div>

                {/* Search Input */}
                <div className="mb-8">
                  <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    {/* Search Results */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold font-hindi">
                          खोज परिणाम ({searchResults.length})
                        </h2>
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
                                      <p className="text-gray-600 text-sm line-clamp-1 mb-2 font-hindi">
                                        {article.titleHindi}
                                      </p>
                                    </div>
                                    {article.isBreaking && (
                                      <Badge className="bg-red-600 text-white animate-pulse">
                                        Breaking
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-gray-600 line-clamp-3 mb-3">
                                    {article.excerpt}
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline">
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
                          <div className="text-gray-400 mb-4">
                            <Search className="w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No results found</h3>
                            <p>Try different keywords or browse our categories</p>
                            <p className="text-sm mt-1 font-hindi">कोई परिणाम नहीं मिला, अलग शब्दों का प्रयास करें</p>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-center font-hindi">लोकप्रिय खोजें</h2>
                    <div className="grid gap-4">
                      {["Breaking news", "Sports", "Politics", "Entertainment", "Technology"].map((search, index) => (
                        <Card 
                          key={search} 
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setSearchQuery(search)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-red-100 p-2 rounded-full">
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
                  </div>
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