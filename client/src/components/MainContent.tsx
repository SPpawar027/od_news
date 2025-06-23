import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Article, Category } from "@shared/schema";
import NewsCard from "./NewsCard";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function MainContent() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { limit, offset }],
    enabled: hasMore,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryById = (id: number | null) => {
    return categories.find(cat => cat.id === id);
  };

  // Update allArticles when new data comes in
  useEffect(() => {
    if (articles.length > 0) {
      if (offset === 0) {
        setAllArticles(articles);
      } else {
        setAllArticles(prev => [...prev, ...articles]);
      }
      setIsLoadingMore(false);
      
      // Check if we have less articles than requested, meaning no more data
      if (articles.length < limit) {
        setHasMore(false);
      }
    }
  }, [articles, offset, limit]);

  // Infinite scroll observer
  const lastArticleRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    if (node) {
      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setOffset(prev => prev + limit);
        }
      }, { threshold: 0.1 });
      
      observerRef.current.observe(node);
    }
  }, [isLoading, isLoadingMore, hasMore, limit]);

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

  const featuredArticle = allArticles[0];
  const regularArticles = allArticles.slice(1);

  return (
    <main className="flex-1 lg:max-w-none" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
      <section className="mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 font-hindi border-b-2 border-red-600 pb-2">
          मुख्य समाचार
        </h2>
        
        {featuredArticle && (
          <NewsCard 
            article={featuredArticle} 
            category={getCategoryById(featuredArticle.categoryId)} 
            featured 
          />
        )}

        <div className="grid gap-4 lg:gap-6">
          {regularArticles.map((article, index) => (
            <div
              key={`regular-${article.id}-${index}`}
              ref={index === regularArticles.length - 1 ? lastArticleRef : null}
            >
              <NewsCard 
                article={article} 
                category={getCategoryById(article.categoryId)} 
              />
            </div>
          ))}
        </div>

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="mt-8 text-center">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex">
                  <div className="w-32 h-24 bg-gray-200 rounded flex-shrink-0"></div>
                  <div className="p-4 flex-1">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End of content indicator */}
        {!hasMore && allArticles.length > 0 && (
          <div className="mt-8 text-center py-6 border-t border-gray-200">
            <p className="text-gray-500 font-hindi">सभी समाचार लोड हो गए</p>
          </div>
        )}
      </section>
    </main>
  );
}