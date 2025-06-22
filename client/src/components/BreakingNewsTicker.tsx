import { useQuery } from "@tanstack/react-query";
import type { BreakingNews } from "@shared/schema";

export default function BreakingNewsTicker() {
  const { data: breakingNews = [] } = useQuery<BreakingNews[]>({
    queryKey: ["/api/breaking-news"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const tickerText = breakingNews
    .map(news => news.titleHindi)
    .join(" • ");

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      <div className="flex items-center h-12">
        <div className="bg-yellow-400 text-black px-4 py-2 font-bold text-sm flex-shrink-0 font-hindi">
          🔥 ब्रेकिंग न्यूज़
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-scroll-left">
            <span className="text-white font-medium text-sm font-hindi px-8">
              {tickerText || "समाचार लोड हो रहे हैं..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
