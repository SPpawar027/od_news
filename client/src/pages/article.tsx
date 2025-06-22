import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { Article, Category } from "@shared/schema";
import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { LAYOUT_CONFIG, CATEGORY_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";

export default function ArticlePage() {
  const [match, params] = useRoute("/article/:id");
  const articleId = params?.id ? parseInt(params.id) : null;

  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: ["/api/articles", articleId],
    enabled: !!articleId,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: relatedArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles", { limit: 5, categoryId: article?.categoryId }],
    enabled: !!article?.categoryId,
  });

  if (!match || !articleId) {
    return <div>Article not found</div>;
  }

  if (articleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-hindi">
        <Header />
        <BreakingNewsTicker />
        <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="flex gap-6">
            <LeftSidebar />
            <main className="flex-1" style={{ maxWidth: LAYOUT_CONFIG.content.main.width }}>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
        <BreakingNewsTicker />
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

  const category = categories.find(cat => cat.id === article.categoryId);
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

  const shareUrl = `${window.location.origin}/article/${article.id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      <BreakingNewsTicker />
      
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

            {/* Article Content */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Article Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  {category && (
                    <span className={`${CATEGORY_COLORS[category.color as keyof typeof CATEGORY_COLORS]} text-white text-sm font-semibold px-3 py-1 rounded font-hindi`}>
                      {category.titleHindi}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">{timeAgoHindi}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-hindi leading-tight">
                  {article.titleHindi}
                </h1>
                
                <p className="text-lg text-gray-700 font-hindi leading-relaxed">
                  {article.excerptHindi}
                </p>
              </div>

              {/* Article Image */}
              {article.imageUrl && (
                <div className="relative">
                  <img 
                    src={article.imageUrl} 
                    alt={article.titleHindi}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              {/* Article Body */}
              <div className="p-6">
                <div className="prose prose-lg max-w-none font-hindi">
                  <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                    {article.contentHindi}
                  </p>
                </div>
              </div>

              {/* Social Share */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 size={20} className="text-gray-600" />
                    <span className="text-gray-700 font-medium font-hindi">साझा करें:</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook size={16} />
                      <span className="text-sm font-hindi">Facebook</span>
                    </a>
                    
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.titleHindi)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      <Twitter size={16} />
                      <span className="text-sm font-hindi">Twitter</span>
                    </a>
                    
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(article.titleHindi + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span className="text-sm font-hindi">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-hindi border-b-2 border-red-600 pb-2">
                  संबंधित समाचार
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.slice(0, 4).map((relatedArticle) => (
                    <article key={relatedArticle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <a href={`/article/${relatedArticle.id}`}>
                        {relatedArticle.imageUrl && (
                          <img 
                            src={relatedArticle.imageUrl} 
                            alt={relatedArticle.titleHindi}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 font-hindi leading-tight">
                            {relatedArticle.titleHindi}
                          </h3>
                          <p className="text-gray-600 text-sm font-hindi line-clamp-2">
                            {relatedArticle.excerptHindi}
                          </p>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>
          
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}