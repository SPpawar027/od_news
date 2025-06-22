import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { COLOR_GRADIENTS } from "@/lib/constants";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function LeftSidebar() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <aside className="flex-shrink-0" style={{ width: LAYOUT_CONFIG.sidebar.left.width }}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4 font-hindi">समाचार श्रेणियां</h3>
        <nav className="space-y-2">
          {categories.map((category) => (
            <a 
              key={category.id}
              href={`/category/${category.slug}`} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div 
                className={`w-8 h-8 bg-gradient-to-br ${COLOR_GRADIENTS[category.color as keyof typeof COLOR_GRADIENTS]} rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}
              >
                <span className="text-white text-sm">{category.icon}</span>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-red-600 font-hindi">
                {category.titleHindi}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
