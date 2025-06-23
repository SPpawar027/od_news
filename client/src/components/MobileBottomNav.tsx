import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
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
  Star,
  Target,
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
  return Star;
};

const getIconColor = (categoryTitle: string) => {
  const title = categoryTitle.toLowerCase();
  if (title.includes('news') || title.includes('top')) return 'text-blue-600';
  if (title.includes('sport')) return 'text-emerald-600';
  if (title.includes('business')) return 'text-violet-600';
  if (title.includes('tech')) return 'text-amber-600';
  if (title.includes('health')) return 'text-rose-600';
  if (title.includes('entertainment')) return 'text-pink-600';
  if (title.includes('world')) return 'text-indigo-600';
  if (title.includes('politics')) return 'text-orange-600';
  if (title.includes('gaming')) return 'text-cyan-600';
  return 'text-slate-600';
};

export default function MobileBottomNav() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex justify-center space-x-8 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center py-2 px-2 gap-3 min-w-max">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.title);
            const iconColor = getIconColor(category.title);
          
            return (
              <a 
                key={category.id}
                href={`/category/${category.slug}`} 
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <IconComponent className={`w-5 h-5 ${iconColor} group-hover:scale-110 transition-transform duration-200`} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-75"></div>
                </div>
                <span className="text-xs text-gray-600 mt-1 font-hindi text-center leading-tight max-w-[60px] truncate">
                  {category.titleHindi}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}