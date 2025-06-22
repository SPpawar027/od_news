import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Article, Category } from "@shared/schema";
import NewsCard from "./NewsCard";
import { Button } from "@/components/ui/button";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function MainContent() {
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { limit, offset }],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryById = (id: number | null) => {
    return categories.find(cat => cat.id === id);
  };

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (isLoading && offset === 0) {
    return (
      <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg p-6">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-hindi border-b-2 border-red-600 pb-2">
          मुख्य समाचार
        </h2>
        
        {featuredArticle && (
          <NewsCard 
            article={featuredArticle} 
            category={getCategoryById(featuredArticle.categoryId)} 
            featured 
          />
        )}

        <div className="grid gap-6">
          {regularArticles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              category={getCategoryById(article.categoryId)} 
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={loadMore}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors font-hindi"
            disabled={isLoading}
          >
            {isLoading ? "लोड हो रहा है..." : "और समाचार लोड करें"}
          </Button>
        </div>
      </section>
    </main>
  );
}
