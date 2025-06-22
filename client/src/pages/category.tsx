import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import type { Article, Category } from "@shared/schema";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const [match, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug;
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories.find(cat => cat.slug === categorySlug);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { limit, offset, categoryId: category?.id }],
    enabled: !!category?.id,
  });

  if (!match || !categorySlug) {
    return <div>Category not found</div>;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 font-hindi">
        <Header />
        <BreakingNewsTicker />
        <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 font-hindi">श्रेणी नहीं मिली</h1>
            <p className="text-gray-600 font-hindi">यह श्रेणी उपलब्ध नहीं है या हटा दी गई है।</p>
            <a href="/" className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors font-hindi">
              होम पेज पर वापस जाएं
            </a>
          </div>
        </div>
      </div>
    );
  }

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      
      {/* Large Banner Advertisement */}
      <div className="w-full bg-gray-100 flex justify-center py-4">
        <div 
          className="bg-white border-2 border-dashed border-gray-300 flex items-center justify-center"
          style={{ 
            width: LAYOUT_CONFIG.banner.width, 
            height: LAYOUT_CONFIG.banner.height 
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-lg font-semibold">Large Banner Advertisement</div>
            <div className="text-sm">
              {LAYOUT_CONFIG.banner.width} × {LAYOUT_CONFIG.banner.height}
            </div>
          </div>
        </div>
      </div>

      <BreakingNewsTicker />

      {/* Main Content Container */}
      <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex gap-6">
          <LeftSidebar />
          
          <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
            {/* Back Button */}
            <div className="mb-6">
              <a 
                href="/" 
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors font-hindi"
              >
                <ArrowLeft size={20} />
                <span>वापस जाएं</span>
              </a>
            </div>

            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">{category.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-hindi">
                    {category.nameHindi}
                  </h1>
                  <p className="text-gray-600 font-hindi">
                    {category.nameHindi} से जुड़ी सभी खबरें
                  </p>
                </div>
              </div>
              <div className="border-b-2 border-red-600 w-16"></div>
            </div>

            {/* Articles Section */}
            {isLoading && offset === 0 ? (
              <div className="animate-pulse space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex">
                      <div className="w-32 h-24 bg-gray-200 rounded mr-4"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {articles.map((article) => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      category={category} 
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
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-hindi">
                  कोई समाचार नहीं मिला
                </h3>
                <p className="text-gray-600 font-hindi">
                  इस श्रेणी में अभी तक कोई समाचार उपलब्ध नहीं है।
                </p>
                <a href="/" className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors font-hindi">
                  होम पेज पर वापस जाएं
                </a>
              </div>
            )}
          </main>
          
          <RightSidebar />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="mx-auto px-4 py-8" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-red-600 font-inter">OD</span>
                <span className="text-2xl font-bold text-white font-inter ml-1">NEWS</span>
              </div>
              <p className="text-gray-400 text-sm font-hindi">
                भारत की अग्रणी समाचार वेबसाइट। सच्ची और निष्पक्ष पत्रकारिता के लिए प्रतिबद्ध।
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">त्वरित लिंक</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">होम</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">लाइव टीवी</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">वीडियो</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">फोटो</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">श्रेणियां</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">राष्ट्रीय</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">अंतरराष्ट्रीय</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">खेल</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">मनोरंजन</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">संपर्क</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="font-hindi">ईमेल: info@odnews.com</li>
                <li className="font-hindi">फोन: +91 11 1234 5678</li>
                <li className="font-hindi">पता: नई दिल्ली, भारत</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p className="font-hindi">© 2025 OD News. सभी अधिकार सुरक्षित हैं।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}