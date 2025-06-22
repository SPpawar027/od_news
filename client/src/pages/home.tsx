import Header from "@/components/Header";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import { LAYOUT_CONFIG } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-hindi">
      <Header />
      
      {/* Large Banner Advertisement */}
      <div className="w-full bg-gray-100 flex justify-center py-4">
        <div 
          className="bg-white border-2 border-dashed border-gray-300 flex items-center justify-center"
          style={{ 
            width: LAYOUT_CONFIG.banner.width, 
            height: LAYOUT_CONFIG.banner.height 
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-lg font-semibold">Large Banner Advertisement</div>
            <div className="text-sm">
              {LAYOUT_CONFIG.banner.width} × {LAYOUT_CONFIG.banner.height}
            </div>
          </div>
        </div>
      </div>

      <BreakingNewsTicker />

      {/* Main Content Container */}
      <div className="mx-auto px-4 py-6" style={{ maxWidth: LAYOUT_CONFIG.header.maxWidth }}>
        <div className="flex gap-6">
          <LeftSidebar />
          <MainContent />
          <RightSidebar />
        </div>
      </div>

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
