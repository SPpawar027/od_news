import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  MapPin
} from "lucide-react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

export default function RightSidebar() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { data: trendingArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/trending-articles"],
  });

  useEffect(() => {
    // Simulate weather data for major Indian cities
    const cities = [
      { name: "New Delhi", temp: 28, condition: "Clear", humidity: 65, wind: 12, visibility: 8 },
      { name: "Mumbai", temp: 32, condition: "Partly Cloudy", humidity: 78, wind: 15, visibility: 6 },
      { name: "Bangalore", temp: 24, condition: "Cloudy", humidity: 72, wind: 8, visibility: 7 },
      { name: "Kolkata", temp: 30, condition: "Rain", humidity: 85, wind: 18, visibility: 4 }
    ];
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setWeather({
      location: randomCity.name,
      temperature: randomCity.temp,
      condition: randomCity.condition,
      humidity: randomCity.humidity,
      windSpeed: randomCity.wind,
      visibility: randomCity.visibility,
      icon: randomCity.condition.toLowerCase()
    });
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('clear') || condition.includes('sunny')) return Sun;
    if (condition.includes('rain')) return CloudRain;
    if (condition.includes('snow')) return CloudSnow;
    if (condition.includes('cloud')) return Cloud;
    return Sun;
  };

  return (
    <aside className="flex-shrink-0" style={{ width: LAYOUT_CONFIG.sidebar.right.width }}>
      {/* Weather Widget */}
      {weather && (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mb-6 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold text-sm">{weather.location}</span>
            </div>
            <div className="text-xs opacity-80">Live Weather</div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm opacity-80">{weather.condition}</div>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {(() => {
                const IconComponent = getWeatherIcon(weather.condition);
                return <IconComponent className="w-8 h-8" />;
              })()}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <Droplets className="w-4 h-4 mx-auto mb-1 opacity-80" />
              <div className="font-semibold">{weather.humidity}%</div>
              <div className="opacity-80">Humidity</div>
            </div>
            <div className="text-center">
              <Wind className="w-4 h-4 mx-auto mb-1 opacity-80" />
              <div className="font-semibold">{weather.windSpeed} km/h</div>
              <div className="opacity-80">Wind</div>
            </div>
            <div className="text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 opacity-80" />
              <div className="font-semibold">{weather.visibility} km</div>
              <div className="opacity-80">Visibility</div>
            </div>
          </div>
        </div>
      )}

      {/* Google Ad Space */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div 
          className="bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center m-4 rounded-lg"
          style={{ 
            width: LAYOUT_CONFIG.ad.google.width, 
            height: LAYOUT_CONFIG.ad.google.height 
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-base font-semibold">Advertisement</div>
            <div className="text-sm">
              {LAYOUT_CONFIG.ad.google.width} × {LAYOUT_CONFIG.ad.google.height}
            </div>
          </div>
        </div>
      </div>

      {/* Trending News */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 font-hindi">ट्रेंडिंग न्यूज़</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <a 
                key={article.id}
                href={`/article/${article.id}`}
                className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors group"
              >
                <div className="relative">
                  <div className={`w-8 h-8 ${index === 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-gray-700 to-gray-800'} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm font-hindi leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.titleHindi}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-gray-500 text-xs">
                      {article.publishedAt && article.publishedAt instanceof Date ? 
                        article.publishedAt.toLocaleDateString('hi-IN') : 
                        article.createdAt && article.createdAt instanceof Date ? 
                        article.createdAt.toLocaleDateString('hi-IN') : 'अज्ञात समय'
                      }
                    </span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-red-600 text-xs font-medium">HOT</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 font-hindi">त्वरित लिंक</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="/live-tv"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">📺</span>
              </div>
              <span className="text-xs font-semibold text-center">Live TV</span>
            </a>
            <a 
              href="/videos"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">🎬</span>
              </div>
              <span className="text-xs font-semibold text-center">Videos</span>
            </a>
            <a 
              href="/rss-news"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">📡</span>
              </div>
              <span className="text-xs font-semibold text-center">RSS News</span>
            </a>
            <a 
              href="/search"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">🔍</span>
              </div>
              <span className="text-xs font-semibold text-center">Search</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}