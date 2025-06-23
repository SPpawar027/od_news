import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Article, Advertisement } from "@shared/schema";
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
  MapPin,
  Star,
  Heart,
  TrendingUp,
  Users
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

interface RashifalData {
  sign: string;
  signHindi: string;
  prediction: string;
  love: number;
  career: number;
  health: number;
  finance: number;
}

export default function RightSidebar() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [todayRashifal, setTodayRashifal] = useState<RashifalData | null>(null);
  const { data: trendingArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles", { categoryId: 1, limit: 5 }],
    queryFn: () => fetch("/api/articles?categoryId=1&limit=5").then(res => res.json()),
  });

  const { data: sidebarAds = [] } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", { position: "sidebar" }],
    queryFn: () => fetch("/api/advertisements?position=sidebar").then(res => res.json()),
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

    // Generate daily rashifal
    const zodiacSigns = [
      { sign: "Aries", hindi: "मेष", predictions: ["आज आपके लिए शुभ दिन है। नए काम शुरू करने का अच्छा समय।", "धन लाभ की संभावना है। परिवार के साथ समय बिताएं।"] },
      { sign: "Taurus", hindi: "वृषभ", predictions: ["आर्थिक मामलों में सावधानी बरतें। स्वास्थ्य का ध्यान रखें।", "प्रेम संबंधों में मधुरता आएगी। काम में सफलता मिलेगी।"] },
      { sign: "Gemini", hindi: "मिथुन", predictions: ["संवाद में सावधानी रखें। मित्रों से सहायता मिल सकती है।", "नए अवसर आपका इंतजार कर रहे हैं। सकारात्मक रहें।"] },
      { sign: "Cancer", hindi: "कर्क", predictions: ["पारिवारिक मामलों में खुशी होगी। धन की आवक बढ़ेगी।", "स्वास्थ्य में सुधार दिखेगा। यात्रा का योग है।"] },
      { sign: "Leo", hindi: "सिंह", predictions: ["आत्मविश्वास बढ़ेगा। नेतृत्व के गुण उजागर होंगे।", "करियर में प्रगति की संभावना। शुभ समाचार मिल सकते हैं।"] },
      { sign: "Virgo", hindi: "कन्या", predictions: ["कार्यक्षेत्र में मेहनत रंग लाएगी। सेहत का ख्याल रखें।", "छोटी यात्रा लाभकारी होगी। पढ़ाई में मन लगेगा।"] },
      { sign: "Libra", hindi: "तुला", predictions: ["रिश्तों में संतुलन बनाए रखें। कला क्षेत्र में रुचि बढ़ेगी।", "व्यापार में फायदा होगा। न्याय आपके साथ होगा।"] },
      { sign: "Scorpio", hindi: "वृश्चिक", predictions: ["गुप्त रूप से कोई योजना सफल होगी। रहस्यमय लाभ मिलेगा।", "जासूसी कार्यों में सफलता। आध्यात्म में रुचि बढ़ेगी।"] },
      { sign: "Sagittarius", hindi: "धनु", predictions: ["दूर की यात्रा शुभ होगी। उच्च शिक्षा में सफलता मिलेगी।", "धर्म कार्यों में भाग लेने का योग। भाग्य साथ देगा।"] },
      { sign: "Capricorn", hindi: "मकर", predictions: ["मेहनत का फल मिलेगा। व्यावसायिक क्षेत्र में प्रगति।", "अनुशासन से सफलता मिलेगी। बुजुर्गों का आशीर्वाद प्राप्त होगा।"] },
      { sign: "Aquarius", hindi: "कुंभ", predictions: ["नवाचार में सफलता मिलेगी। मित्र मंडली का साथ मिलेगा।", "तकनीकी क्षेत्र में लाभ होगा। सामाजिक कार्यों में भाग लें।"] },
      { sign: "Pisces", hindi: "मीन", predictions: ["कल्पना शक्ति बढ़ेगी। कलात्मक कार्यों में सफलता।", "आध्यात्मिक यात्रा का योग। मानसिक शांति मिलेगी।"] }
    ];

    // Rotate zodiac sign based on date and hour for variety
    const today = new Date();
    const signIndex = (today.getDate() + Math.floor(today.getHours() / 2)) % zodiacSigns.length;
    const todaySign = zodiacSigns[signIndex];
    const predictionIndex = today.getHours() % todaySign.predictions.length;
    const todayPrediction = todaySign.predictions[predictionIndex];
    
    setTodayRashifal({
      sign: todaySign.sign,
      signHindi: todaySign.hindi,
      prediction: todayPrediction,
      love: Math.floor(Math.random() * 5) + 1,
      career: Math.floor(Math.random() * 5) + 1,
      health: Math.floor(Math.random() * 5) + 1,
      finance: Math.floor(Math.random() * 5) + 1
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
    <aside className="flex-shrink-0 hidden lg:block space-y-8" style={{ width: LAYOUT_CONFIG.sidebar.right.width }}>
      {/* Weather Widget */}
      {weather && (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
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

      {/* Daily Rashifal */}
      {todayRashifal && (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span className="font-bold text-lg font-hindi">आज का राशिफल</span>
            </div>
            <div className="text-xs opacity-80">
              {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold font-hindi">{todayRashifal.signHindi}</div>
            <div className="text-sm opacity-80">{todayRashifal.sign}</div>
          </div>
          
          <div className="text-sm leading-relaxed mb-4 font-hindi bg-white bg-opacity-20 rounded-lg p-3">
            {todayRashifal.prediction}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span className="font-hindi">प्रेम</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < todayRashifal.love ? 'fill-yellow-300' : 'opacity-30'}`} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span className="font-hindi">करियर</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < todayRashifal.career ? 'fill-yellow-300' : 'opacity-30'}`} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Thermometer className="w-3 h-3" />
                <span className="font-hindi">स्वास्थ्य</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < todayRashifal.health ? 'fill-yellow-300' : 'opacity-30'}`} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span className="font-hindi">धन</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < todayRashifal.finance ? 'fill-yellow-300' : 'opacity-30'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertisement Space */}
      {sidebarAds.length > 0 ? (
        sidebarAds.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow-lg border border-gray-100"
               itemScope itemType="https://schema.org/Advertisement"
               data-ad-id={ad.id}>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-2 text-center">विज्ञापन</div>
              {ad.linkUrl ? (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block"
                   itemProp="url">
                  <img 
                    src={ad.imageUrl || ''} 
                    alt={ad.title}
                    className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
                    style={{ maxWidth: ad.width || 300, maxHeight: ad.height || 250 }}
                    loading="lazy"
                    itemProp="image"
                  />
                  <h4 className="text-sm font-semibold text-gray-900 mt-2 text-center" itemProp="name">{ad.title}</h4>
                </a>
              ) : (
                <div>
                  <img 
                    src={ad.imageUrl || ''} 
                    alt={ad.title}
                    className="w-full h-auto rounded-lg"
                    style={{ maxWidth: ad.width || 300, maxHeight: ad.height || 250 }}
                    loading="lazy"
                    itemProp="image"
                  />
                  <h4 className="text-sm font-semibold text-gray-900 mt-2 text-center" itemProp="name">{ad.title}</h4>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div 
            className="bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center m-4 rounded-lg"
            style={{ 
              width: 300, 
              height: 250 
            }}
          >
            <div className="text-center text-gray-500">
              <div className="text-base font-semibold">Advertisement</div>
              <div className="text-sm">342 × 399</div>
            </div>
          </div>
        </div>
      )}

      {/* Top News */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900 font-hindi">टॉप न्यूज़</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1 font-hindi">मुख्य समाचार से जुड़े ट्रेंडिंग विषय</p>
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

      {/* Advertisements */}
      {sidebarAds.length > 0 && (
        <div className="mb-6 space-y-4">
          {sidebarAds.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-2 text-center">विज्ञापन</div>
                {ad.linkUrl ? (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                      src={ad.imageUrl || ''} 
                      alt={ad.title}
                      className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
                      style={{ maxWidth: ad.width || 300, maxHeight: ad.height || 250 }}
                    />
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 text-center">{ad.title}</h4>
                  </a>
                ) : (
                  <div>
                    <img 
                      src={ad.imageUrl || ''} 
                      alt={ad.title}
                      className="w-full h-auto rounded-lg"
                      style={{ maxWidth: ad.width || 300, maxHeight: ad.height || 250 }}
                    />
                    <h4 className="text-sm font-semibold text-gray-900 mt-2 text-center">{ad.title}</h4>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 font-hindi">सामाजिक मीडिया</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="https://facebook.com/odnews" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">📘</span>
              </div>
              <span className="text-xs font-semibold text-center">Facebook</span>
            </a>
            <a 
              href="https://twitter.com/odnews" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl text-white hover:from-sky-600 hover:to-sky-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">🐦</span>
              </div>
              <span className="text-xs font-semibold text-center">Twitter</span>
            </a>
            <a 
              href="https://instagram.com/odnews" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl text-white hover:from-pink-600 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">📷</span>
              </div>
              <span className="text-xs font-semibold text-center">Instagram</span>
            </a>
            <a 
              href="https://youtube.com/odnews" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-red-600 to-red-700 rounded-xl text-white hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <span className="text-sm font-bold">📹</span>
              </div>
              <span className="text-xs font-semibold text-center">YouTube</span>
            </a>
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

      {/* Footer Section */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-200 text-white">
        <div className="p-6">
          {/* Company Links */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-white font-hindi">कंपनी</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <a href="/advertise" className="text-gray-300 hover:text-white transition-colors">
                Advertise with Us
              </a>
              <a href="/od-reporter" className="text-gray-300 hover:text-white transition-colors">
                OD Reporter
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms & Conditions
              </a>
              <a href="/grievance" className="text-gray-300 hover:text-white transition-colors">
                Grievance Redressal Policy
              </a>
              <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact Us
              </a>
              <a href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 mb-6 border-t border-gray-700 pt-6">
            <h4 className="text-md font-semibold text-white">Contact Information</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Phone:</span>
                <a href="tel:+919993820711" className="hover:text-white transition-colors">
                  +91 99938 20711
                </a>
                <a href="tel:+918818882105" className="hover:text-white transition-colors">
                  +91 88188 82105
                </a>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-gray-400">Email:</span>
                <a href="mailto:contact@ODnews.com" className="hover:text-white transition-colors">
                  contact@ODnews.com
                </a>
              </div>
            </div>
          </div>

          {/* Copyright and Ethics */}
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-xs text-gray-400">
              Copyright © 2024-25 OD Pvt. Ltd., All Rights Reserved.
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              This website follows the DNPA Code of Ethics to ensure ethical digital news publishing and responsible journalism.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}