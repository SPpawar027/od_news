import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import NewsCard from "@/components/NewsCard";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { Rss, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article, Category, RssSource } from "@shared/schema";

export default function RSSNewsPage() {
  const [location] = useLocation();
  const categorySlug = location.split('/')[2]; // Extract category from URL like /rss-news/politics

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: rssSources = [] } = useQuery<RssSource[]>({
    queryKey: ["/api/rss-sources"],
  });

  // Find the current category
  const currentCategory = categories.find(cat => 
    cat.title.toLowerCase().replace(/\s+/g, '-') === categorySlug ||
    cat.titleHindi === categorySlug
  );

  // Filter RSS sources for current category
  const categoryRSSSources = rssSources.filter(source => 
    source.isActive && source.categoryId === currentCategory?.id
  );

  // Filter articles for current category (simulating RSS-imported articles)
  const categoryArticles = articles.filter(article => 
    article.categoryId === currentCategory?.id
  );

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      <BreakingNewsTicker />
      
      <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex gap-6">
          <LeftSidebar />
          
          <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Rss className="w-8 h-8 text-orange-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-hindi">
                    RSS फ़ीड समाचार
                  </h1>
                  {currentCategory && (
                    <p className="text-lg text-gray-600 font-hindi">
                      {currentCategory.titleHindi} श्रेणी
                    </p>
                  )}
                </div>
              </div>
              
              {/* RSS Sources Info */}
              {categoryRSSSources.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 font-hindi">
                    सक्रिय RSS स्रोत ({categoryRSSSources.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryRSSSources.map(source => (
                      <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{source.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {source.articlesImported || 0} articles
                            </Badge>
                            {source.lastFetch && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(source.lastFetch).toLocaleDateString('hi-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Navigation */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!categorySlug ? "default" : "outline"}
                  size="sm"
                  className="font-hindi"
                  onClick={() => window.location.href = '/rss-news'}
                >
                  सभी श्रेणियां
                </Button>
                {categories.map(category => {
                  const slug = category.title.toLowerCase().replace(/\s+/g, '-');
                  const isActive = categorySlug === slug;
                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="font-hindi"
                      onClick={() => window.location.href = `/rss-news/${slug}`}
                    >
                      {category.titleHindi}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Articles Grid */}
            {categoryArticles.length === 0 ? (
              <div className="text-center py-12">
                <Rss className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2 font-hindi">
                  {currentCategory ? 'इस श्रेणी में कोई समाचार नहीं मिला' : 'कोई RSS समाचार उपलब्ध नहीं है'}
                </h2>
                <p className="text-gray-600 font-hindi mb-4">
                  {currentCategory 
                    ? `${currentCategory.titleHindi} श्रेणी के लिए RSS फ़ीड से आयातित समाचार यहां दिखाए जाएंगे।`
                    : 'RSS फ़ीड से आयातित समाचार यहां दिखाए जाएंगे।'
                  }
                </p>
                {categoryRSSSources.length === 0 && currentCategory && (
                  <p className="text-sm text-gray-500 font-hindi">
                    इस श्रेणी के लिए कोई सक्रिय RSS स्रोत कॉन्फ़िगर नहीं है।
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    category={currentCategory}
                  />
                ))}
              </div>
            )}

            {/* RSS Feed Status */}
            {categoryRSSSources.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Rss className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 font-hindi">RSS फ़ीड की जानकारी</h4>
                    <p className="text-sm text-blue-700 font-hindi mt-1">
                      ये समाचार स्वचालित रूप से RSS फ़ीड से आयात किए गए हैं। 
                      नवीनतम अपडेट के लिए फ़ीड नियमित रूप से सिंक की जाती हैं।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
          
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}