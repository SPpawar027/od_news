import { Link } from "wouter";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Article, Category } from "@shared/schema";

interface NewsCardProps {
  article: Article;
  category?: Category;
  featured?: boolean;
}

function formatTimeAgoHindi(date: Date | string): string {
  const now = new Date();
  const articleDate = new Date(date);
  const diffMs = now.getTime() - articleDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} मिनट पहले`;
  } else if (diffHours < 24) {
    return `${diffHours} घंटे पहले`;
  } else {
    return `${diffDays} दिन पहले`;
  }
}

export default function NewsCard({ article, category, featured = false }: NewsCardProps) {
  const timeAgoHindi = formatTimeAgoHindi(article.publishedAt || article.createdAt || new Date());

  if (featured) {
    return (
      <Link href={`/article/${article.id}`}>
        <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          {article.imageUrl ? (
            <img 
              src={article.imageUrl} 
              alt={article.titleHindi} 
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">📰</div>
                <div className="text-sm font-hindi">समाचार</div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              {category && (
                <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-xs font-semibold px-2 py-1 rounded font-hindi`}>
                  {category.titleHindi}
                </span>
              )}
              <span className="text-gray-500 text-sm">{timeAgoHindi}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-hindi leading-tight hover:text-red-600 transition-colors">
              {article.titleHindi}
            </h3>
            <p className="text-gray-600 mb-3 font-hindi leading-relaxed">
              {article.excerptHindi}
            </p>
            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {article.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 font-hindi"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <span className="text-red-600 font-semibold hover:text-red-700 font-hindi">
              पूरी खबर पढ़ें →
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.id}`}>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex">
          {article.imageUrl ? (
            <img 
              src={article.imageUrl} 
              alt={article.titleHindi} 
              className="w-32 h-24 object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-32 h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="text-center text-gray-500">
                <div className="text-lg">📰</div>
              </div>
            </div>
          )}
          
          <div className="p-4 flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {category && (
                <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-xs font-semibold px-2 py-1 rounded font-hindi`}>
                  {category.titleHindi}
                </span>
              )}
              <span className="text-gray-500 text-sm">{timeAgoHindi}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2 font-hindi leading-tight hover:text-red-600 transition-colors">
              {article.titleHindi}
            </h3>
            <p className="text-gray-600 text-sm font-hindi leading-relaxed line-clamp-2 mb-2">
              {article.excerptHindi}
            </p>
            {article.hashtags && article.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {article.hashtags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-red-50 text-red-600 text-xs px-1.5 py-0.5 rounded border border-red-200 font-hindi"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {article.authorName && (
              <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">लेखक:</span>
                <span className="text-xs text-gray-700 ml-1 font-medium">{article.authorName}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}