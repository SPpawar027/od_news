import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { 
  Newspaper, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Globe, 
  Briefcase, 
  Heart, 
  Gamepad2,
  Music,
  Camera
} from "lucide-react";

const getCategoryIcon = (categoryTitle: string) => {
  const title = categoryTitle.toLowerCase();
  if (title.includes('news') || title.includes('top')) return Newspaper;
  if (title.includes('sport')) return Trophy;
  if (title.includes('business') || title.includes('finance')) return Briefcase;
  if (title.includes('tech') || title.includes('science')) return Zap;
  if (title.includes('health')) return Heart;
  if (title.includes('entertainment') || title.includes('celebrity')) return Music;
  if (title.includes('world') || title.includes('international')) return Globe;
  if (title.includes('politics')) return TrendingUp;
  if (title.includes('gaming')) return Gamepad2;
  return Camera; // Default icon
};

const getIconColor = (categoryTitle: string) => {
  const title = categoryTitle.toLowerCase();
  if (title.includes('news') || title.includes('top')) return 'text-blue-500';
  if (title.includes('sport')) return 'text-green-500';
  if (title.includes('business')) return 'text-purple-500';
  if (title.includes('tech')) return 'text-yellow-500';
  if (title.includes('health')) return 'text-red-500';
  if (title.includes('entertainment')) return 'text-pink-500';
  if (title.includes('world')) return 'text-indigo-500';
  if (title.includes('politics')) return 'text-orange-500';
  if (title.includes('gaming')) return 'text-cyan-500';
  return 'text-gray-500';
};

export default function LeftSidebar() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <aside className="flex-shrink-0" style={{ width: LAYOUT_CONFIG.sidebar.left.width }}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex-shrink-0" style={{ width: LAYOUT_CONFIG.sidebar.left.width }}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 font-hindi">समाचार श्रेणियां</h3>
        <nav className="space-y-3">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.title);
            const iconColor = getIconColor(category.title);
            
            return (
              <a 
                key={category.id}
                href={`/category/${category.slug}`} 
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">•</span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors font-hindi text-sm">
                    {category.titleHindi}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 font-hindi">
                    नवीनतम समाचार
                  </p>
                </div>
              </a>
            );
          })}
        </nav>

        {/* Additional Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-600 mb-4 font-hindi">अन्य सेवाएं</h4>
          <div className="space-y-2">
            <a 
              href="/live-tv"
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-red-900 to-black rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-red-500 text-lg">📺</span>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 font-hindi">लाइव टीवी</span>
            </a>
            
            <a 
              href="/videos"
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-900 to-black rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-purple-500 text-lg">🎬</span>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 font-hindi">वीडियो</span>
            </a>
            
            <a 
              href="/rss-news"
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-900 to-black rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-green-500 text-lg">📡</span>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 font-hindi">आरएसएस न्यूज़</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
