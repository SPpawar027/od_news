import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { 
  Home,
  TrendingUp, 
  Zap, 
  Trophy, 
  Globe2, 
  Briefcase, 
  Heart, 
  Gamepad2,
  Music2,
  Camera,
  Star,
  Target,
  Shield,
  Sparkles,
  Activity,
  Newspaper
} from "lucide-react";

const getCategoryIcon = (categoryTitle: string) => {
  const title = categoryTitle.toLowerCase();
  if (title.includes('news') || title.includes('top')) return Newspaper;
  if (title.includes('sport')) return Trophy;
  if (title.includes('business') || title.includes('finance')) return Briefcase;
  if (title.includes('tech') || title.includes('science')) return Zap;
  if (title.includes('health')) return Heart;
  if (title.includes('entertainment') || title.includes('celebrity')) return Music2;
  if (title.includes('world') || title.includes('international')) return Globe2;
  if (title.includes('politics')) return Target;
  if (title.includes('gaming')) return Gamepad2;
  if (title.includes('breaking')) return Activity;
  if (title.includes('trending')) return Sparkles;
  return Star; // Default icon
};

const getIconStyles = (categoryTitle: string) => {
  const title = categoryTitle.toLowerCase();
  if (title.includes('news') || title.includes('top')) return {
    iconColor: 'text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    hoverBg: 'group-hover:from-blue-100 group-hover:to-blue-200'
  };
  if (title.includes('sport')) return {
    iconColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100',
    hoverBg: 'group-hover:from-emerald-100 group-hover:to-emerald-200'
  };
  if (title.includes('business')) return {
    iconColor: 'text-violet-600',
    bgGradient: 'from-violet-50 to-violet-100',
    hoverBg: 'group-hover:from-violet-100 group-hover:to-violet-200'
  };
  if (title.includes('tech')) return {
    iconColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-amber-100',
    hoverBg: 'group-hover:from-amber-100 group-hover:to-amber-200'
  };
  if (title.includes('health')) return {
    iconColor: 'text-rose-600',
    bgGradient: 'from-rose-50 to-rose-100',
    hoverBg: 'group-hover:from-rose-100 group-hover:to-rose-200'
  };
  if (title.includes('entertainment')) return {
    iconColor: 'text-pink-600',
    bgGradient: 'from-pink-50 to-pink-100',
    hoverBg: 'group-hover:from-pink-100 group-hover:to-pink-200'
  };
  if (title.includes('world')) return {
    iconColor: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100',
    hoverBg: 'group-hover:from-indigo-100 group-hover:to-indigo-200'
  };
  if (title.includes('politics')) return {
    iconColor: 'text-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    hoverBg: 'group-hover:from-orange-100 group-hover:to-orange-200'
  };
  if (title.includes('gaming')) return {
    iconColor: 'text-cyan-600',
    bgGradient: 'from-cyan-50 to-cyan-100',
    hoverBg: 'group-hover:from-cyan-100 group-hover:to-cyan-200'
  };
  return {
    iconColor: 'text-slate-600',
    bgGradient: 'from-slate-50 to-slate-100',
    hoverBg: 'group-hover:from-slate-100 group-hover:to-slate-200'
  };
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
            const iconStyles = getIconStyles(category.title);
            
            return (
              <a 
                key={category.id}
                href={`/category/${category.slug}`} 
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group"
              >
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${iconStyles.bgGradient} ${iconStyles.hoverBg} rounded-xl flex items-center justify-center shadow-md border border-gray-200 transform group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className={`w-6 h-6 ${iconStyles.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-75 animate-pulse"></div>
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
