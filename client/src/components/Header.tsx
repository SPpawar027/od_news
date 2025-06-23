import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DateTimeDisplay from "./DateTimeDisplay";
import { LAYOUT_CONFIG } from "@/lib/constants";
import type { Advertisement } from "@shared/schema";
import { User, LogIn, Home, Search, Video, Tv } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  // Static header advertisement (1892px × 257px)
  const staticHeaderAd = {
    id: 1,
    title: "Google Ads - Header Banner",
    imageUrl: "https://via.placeholder.com/1892x257/FF6B35/FFFFFF?text=Google+Ads+Header+Banner+1892x257",
    linkUrl: "https://ads.google.com",
    position: "header",
    isActive: true,
    width: 1892,
    height: 257
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/live-tv", label: "Live TV" },
    { path: "/videos", label: "Videos" },
    { path: "/search", label: "Search" }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex items-center justify-between h-16">
          {/* Logo Section with Mobile Navigation */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl md:text-3xl font-bold brand-red font-inter">OD</span>
              <span className="text-2xl md:text-3xl font-bold text-news-black font-inter ml-1">NEWS</span>
              <span className="bg-brand-red text-white text-xs font-semibold px-1 md:px-2 py-1 rounded-full ml-1 md:ml-2 animate-pulse-glow font-inter">
                LIVE
              </span>
            </Link>
            
            {/* Mobile Navigation Buttons */}
            <div className="flex md:hidden items-center space-x-1 ml-2">
              <Link 
                href="/" 
                className={`p-2 rounded-lg transition-colors ${
                  location === "/" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Home"
              >
                <Home className="w-4 h-4" />
              </Link>
              <Link 
                href="/search" 
                className={`p-2 rounded-lg transition-colors ${
                  location === "/search" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </Link>
              <Link 
                href="/live-tv" 
                className={`p-2 rounded-lg transition-colors ${
                  location === "/live-tv" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Live TV"
              >
                <Tv className="w-4 h-4" />
              </Link>
              <Link 
                href="/videos" 
                className={`p-2 rounded-lg transition-colors ${
                  location === "/videos" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Videos"
              >
                <Video className="w-4 h-4" />
              </Link>
            </div>
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

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Google Login Account Button */}
            <Link
              href="/account"
              className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 rounded-lg px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>

            {/* Date/Time Display */}
            <div className="hidden lg:block">
              <DateTimeDisplay />
            </div>
          </div>
        </div>
      </div>
      
      {/* Static Header Advertisement Banner */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto px-4 py-3" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="text-center">
            <div className="inline-block">
              <div className="text-xs text-gray-500 mb-1">विज्ञापन</div>
              <a href={staticHeaderAd.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                  src={staticHeaderAd.imageUrl} 
                  alt={staticHeaderAd.title}
                  className="mx-auto rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    maxWidth: Math.min(staticHeaderAd.width, 1892), 
                    maxHeight: staticHeaderAd.height,
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
