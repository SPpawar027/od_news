import type { Article, Category } from "@shared/schema";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  article: Article;
  category?: Category;
  featured?: boolean;
}

export default function NewsCard({ article, category, featured = false }: NewsCardProps) {
  const timeAgo = article.publishedAt 
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : '';

  const timeAgoHindi = timeAgo
    .replace('about ', 'लगभग ')
    .replace(' ago', ' पहले')
    .replace('hours', 'घंटे')
    .replace('hour', 'घंटा')
    .replace('minutes', 'मिनट')
    .replace('minute', 'मिनट')
    .replace('days', 'दिन')
    .replace('day', 'दिन');

  if (featured) {
    return (
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden hover:shadow-md transition-shadow">
        <a href={`/article/${article.id}`} className="block">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.titleHindi} 
              className="w-full h-48 object-cover"
            />
          )}
          
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              {category && (
                <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-xs font-semibold px-2 py-1 rounded font-hindi`}>
                  {category.nameHindi}
                </span>
              )}
              <span className="text-gray-500 text-sm">{timeAgoHindi}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-hindi leading-tight hover:text-red-600 transition-colors">
              {article.titleHindi}
            </h3>
            <p className="text-gray-600 mb-4 font-hindi leading-relaxed">
              {article.excerptHindi}
            </p>
            <span className="text-red-600 font-semibold hover:text-red-700 font-hindi">
              पूरी खबर पढ़ें →
            </span>
          </div>
        </a>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <a href={`/article/${article.id}`} className="block">
        <div className="flex">
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.titleHindi} 
              className="w-32 h-24 object-cover flex-shrink-0"
            />
          )}
          
          <div className="p-4 flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {category && (
                <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-xs font-semibold px-2 py-1 rounded font-hindi`}>
                  {category.nameHindi}
                </span>
              )}
              <span className="text-gray-500 text-sm">{timeAgoHindi}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2 font-hindi leading-tight hover:text-red-600 transition-colors">
              {article.titleHindi}
            </h3>
            <p className="text-gray-600 text-sm font-hindi line-clamp-2">
              {article.excerptHindi}
            </p>
          </div>
        </div>
      </a>
    </article>
  );
}
