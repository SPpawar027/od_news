import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function RightSidebar() {
  const { data: trendingArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/trending-articles"],
  });

  return (
    <aside className="flex-shrink-0" style={{ width: LAYOUT_CONFIG.sidebar.right.width }}>
      {/* Google Ad Space */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div 
          className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center m-4"
          style={{ 
            width: LAYOUT_CONFIG.ad.google.width, 
            height: LAYOUT_CONFIG.ad.google.height 
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-base font-semibold">Google Advertisement</div>
            <div className="text-sm">
              {LAYOUT_CONFIG.ad.google.width} × {LAYOUT_CONFIG.ad.google.height}
            </div>
          </div>
        </div>
      </div>

      {/* Trending News */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 font-hindi">ट्रेंडिंग न्यूज़</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <div 
                key={article.id}
                className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0"
              >
                <span className={`${index === 0 ? 'bg-red-600' : 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0`}>
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm font-hindi leading-tight">
                    {article.titleHindi}
                  </h4>
                  <span className="text-gray-500 text-xs">
                    {article.publishedAt ? 
                      new Date(article.publishedAt).toLocaleDateString('hi-IN') : 
                      'अज्ञात समय'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 font-hindi">फोटो गैलरी</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100" 
              alt="Sports victory celebration" 
              className="rounded-lg w-full h-20 object-cover hover:opacity-90 cursor-pointer transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100" 
              alt="Technology innovation summit" 
              className="rounded-lg w-full h-20 object-cover hover:opacity-90 cursor-pointer transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100" 
              alt="Cultural festival celebration" 
              className="rounded-lg w-full h-20 object-cover hover:opacity-90 cursor-pointer transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1555992336-03a23c37245f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100" 
              alt="Indian Parliament building" 
              className="rounded-lg w-full h-20 object-cover hover:opacity-90 cursor-pointer transition-opacity"
            />
          </div>
          <button className="w-full mt-4 text-red-600 font-semibold text-sm hover:text-red-700 font-hindi">
            सभी फोटो देखें →
          </button>
        </div>
      </div>

      {/* Advertisement Space */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-base font-semibold">Advertisement Space</div>
            <div className="text-sm">342px × 256px</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
