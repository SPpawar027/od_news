import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DateTimeDisplay from "./DateTimeDisplay";
import { LAYOUT_CONFIG } from "@/lib/constants";
import type { Advertisement } from "@shared/schema";

export default function Header() {
  const [location] = useLocation();

  const { data: headerAds = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", { position: "header" }],
    queryFn: () => fetch("/api/advertisements?position=header").then(res => res.json()),
  });

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/live-tv", label: "Live TV" },
    { path: "/videos", label: "Videos" },
    { path: "/rss-news", label: "RSS News" },
    { path: "/search", label: "Search" },
    { path: "/account", label: "Account" }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold brand-red font-inter">OD</span>
              <span className="text-3xl font-bold text-news-black font-inter ml-1">NEWS</span>
              <span className="bg-brand-red text-white text-xs font-semibold px-2 py-1 rounded-full ml-2 animate-pulse-glow font-inter">
                LIVE
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-inter">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-medium transition-colors ${
                  location === item.path
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Date/Time Display */}
          <div className="hidden lg:block">
            <DateTimeDisplay />
          </div>
        </div>
      </div>
      
      {/* Header Advertisement Banner */}
      {headerAds.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="mx-auto px-4 py-3" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
            <div className="text-center">
              {headerAds.map((ad) => (
                <div key={ad.id} className="inline-block">
                  <div className="text-xs text-gray-500 mb-1">विज्ञापन</div>
                  {ad.linkUrl ? (
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <img 
                        src={ad.imageUrl || ''} 
                        alt={ad.title}
                        className="mx-auto rounded-lg hover:opacity-90 transition-opacity"
                        style={{ 
                          maxWidth: Math.min(ad.width || 1892, 1892), 
                          maxHeight: ad.height || 257,
                          width: 'auto',
                          height: 'auto'
                        }}
                      />
                    </a>
                  ) : (
                    <img 
                      src={ad.imageUrl || ''} 
                      alt={ad.title}
                      className="mx-auto rounded-lg"
                      style={{ 
                        maxWidth: Math.min(ad.width || 1892, 1892), 
                        maxHeight: ad.height || 257,
                        width: 'auto',
                        height: 'auto'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
