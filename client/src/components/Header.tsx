import { Link, useLocation } from "wouter";
import DateTimeDisplay from "./DateTimeDisplay";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function Header() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/live-tv", label: "Live TV" },
    { path: "/videos", label: "Videos" },
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
    </header>
  );
}
