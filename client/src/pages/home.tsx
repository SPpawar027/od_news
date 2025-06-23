import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LAYOUT_CONFIG } from "@/lib/constants";
import { useScrollTrigger } from "@/hooks/use-scroll";

export default function Home() {
  const { sidebarVisible, isAtTop, scrollProgress } = useScrollTrigger(500);

  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />

      {/* Main Content Container with Fixed Sidebars */}
      <div className="relative">
        <div className="mx-auto px-4 py-6 pb-20 lg:pb-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="flex gap-6">
            {/* Fixed Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                <LeftSidebar />
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 lg:flex lg:gap-6">
              <MainContent />
              
              {/* Fixed Right Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Progress Indicator */}
        {!isAtTop && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="mx-auto px-4 py-8" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-red-600 font-inter">OD</span>
                <span className="text-2xl font-bold text-white font-inter ml-1">NEWS</span>
              </div>
              <p className="text-gray-400 text-sm font-hindi">
                भारत की अग्रणी समाचार वेबसाइट। सच्ची और निष्पक्ष पत्रकारिता के लिए प्रतिबद्ध।
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">त्वरित लिंक</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">होम</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">लाइव टीवी</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">वीडियो</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">फोटो</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">श्रेणियां</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">राष्ट्रीय</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">अंतरराष्ट्रीय</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">खेल</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white font-hindi">मनोरंजन</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 font-hindi">संपर्क</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="font-hindi">ईमेल: info@odnews.com</li>
                <li className="font-hindi">फोन: +91 11 1234 5678</li>
                <li className="font-hindi">पता: नई दिल्ली, भारत</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p className="font-hindi">© 2025 OD News. सभी अधिकार सुरक्षित हैं।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
