import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import { Mail, Phone, MapPin, Target, Users, TrendingUp } from "lucide-react";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Advertise with Us - OD News"
        description="Partner with OD News to reach millions of engaged readers. Explore our advertising opportunities and digital marketing solutions."
        keywords="advertising, digital marketing, news platform, brand promotion, OD News"
      />
      
      <Header />
      <BreakingNewsTicker />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Fixed Left Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Advertise with OD News
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Reach millions of engaged readers across India
                </p>
                <p className="text-lg text-gray-600 font-hindi">
                  भारत भर के लाखों पाठकों तक पहुंचें
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">5M+</h3>
                  <p className="text-gray-600">Monthly Readers</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">25M+</h3>
                  <p className="text-gray-600">Page Views</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">15+</h3>
                  <p className="text-gray-600">Categories</p>
                </div>
              </div>

              {/* Advertising Options */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Advertising Solutions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Display Advertising</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Banner advertisements</li>
                      <li>• Sidebar placements</li>
                      <li>• Header and footer slots</li>
                      <li>• Mobile responsive ads</li>
                    </ul>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sponsored Content</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Native advertising</li>
                      <li>• Sponsored articles</li>
                      <li>• Brand partnerships</li>
                      <li>• Video content integration</li>
                    </ul>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Live TV Integration</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Pre-roll video ads</li>
                      <li>• Live stream sponsorship</li>
                      <li>• Breaking news ticker ads</li>
                      <li>• Interactive promotions</li>
                    </ul>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Social Media Amplification</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Cross-platform promotion</li>
                      <li>• Social media campaigns</li>
                      <li>• Influencer collaborations</li>
                      <li>• Viral content creation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Contact Our Advertising Team
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-600">+91 99938 20711</p>
                    <p className="text-gray-600">+91 88188 82105</p>
                  </div>
                  <div className="text-center">
                    <Mail className="w-8 h-8 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">contact@ODnews.com</p>
                    <p className="text-gray-600">ads@ODnews.com</p>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <p className="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sat: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Right Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}