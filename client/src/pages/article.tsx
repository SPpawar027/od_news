import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { Article, Category } from "@shared/schema";
import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { LAYOUT_CONFIG, CATEGORY_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";

export default function ArticlePage() {
  const [match, params] = useRoute("/article/:id");
  const articleId = params?.id ? parseInt(params.id) : null;

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories.find(cat => cat.id === article?.categoryId);

  if (articleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-hindi">
        <Header />
        <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="flex gap-6">
            <LeftSidebar />
            <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </main>
            <RightSidebar />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 font-hindi">
        <Header />
        <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 font-hindi">लेख नहीं मिला</h1>
            <p className="text-gray-600 font-hindi">यह लेख उपलब्ध नहीं है या हटा दिया गया है।</p>
            <a href="/" className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors font-hindi">
              होम पेज पर वापस जाएं
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Format the time ago in Hindi
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt || article.createdAt || new Date()), { addSuffix: true })
    .replace('about', 'लगभग')
    .replace('less than a minute ago', '1 मिनट से कम समय पहले')
    .replace('minutes ago', 'मिनट पहले')
    .replace('minute ago', 'मिनट पहले')
    .replace('hours ago', 'घंटे पहले')
    .replace('hour ago', 'घंटा पहले')
    .replace('days ago', 'दिन पहले')
    .replace('day ago', 'दिन पहले')
    .replace('months ago', 'महीने पहले')
    .replace('month ago', 'महीना पहले')
    .replace('years ago', 'साल पहले')
    .replace('year ago', 'साल पहले')
    .replace('ago', 'पहले')
    .replace('hours', 'घंटे')
    .replace('hour', 'घंटा')
    .replace('minutes', 'मिनट')
    .replace('minute', 'मिनट')
    .replace('days', 'दिन')
    .replace('day', 'दिन');

  const shareUrl = `${window.location.origin}/article/${article.id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      
      <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex gap-6">
          <LeftSidebar />
          
          <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
            {/* Back Button */}
            <div className="mb-6">
              <a 
                href="/" 
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-hindi"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>वापस जाएं</span>
              </a>
            </div>

            {/* Article Content */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Article Header */}
              <div className="p-8 pb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {category && (
                    <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-sm font-semibold px-3 py-1 rounded font-hindi`}>
                      {category.titleHindi}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">{timeAgo}</span>
                  {article.isBreaking && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse font-hindi">
                      ब्रेकिंग
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4 font-hindi leading-tight">
                  {article.titleHindi}
                </h1>
                
                <p className="text-xl text-gray-700 font-hindi leading-relaxed mb-6">
                  {article.excerptHindi}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    {article.authorName && (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {article.authorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{article.authorName}</p>
                          <p className="text-xs text-gray-500 font-hindi">संवाददाता</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-hindi mr-2">साझा करें:</span>
                    <button 
                      onClick={() => navigator.share?.({ url: shareUrl, title: article.titleHindi })}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <a 
                      href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Facebook पर साझा करें"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.titleHindi)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
                      title="Twitter पर साझा करें"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(article.titleHindi + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="WhatsApp पर साझा करें"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Article Image */}
              {article.imageUrl && (
                <div className="px-8 pb-6">
                  <img 
                    src={article.imageUrl} 
                    alt={article.titleHindi}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article Body */}
              <div className="px-8 pb-8">
                <div className="prose prose-lg max-w-none font-hindi">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.contentHindi?.replace(/\n/g, '<br>') || '' }}
                  />
                </div>
              </div>
            </article>
          </main>
          
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}