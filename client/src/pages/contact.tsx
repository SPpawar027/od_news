import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Contact Us - OD News"
        description="Get in touch with OD News team. Find our contact information, office hours, and ways to reach us."
        keywords="contact, OD News, customer support, phone, email"
      />
      
      <Header />
      <BreakingNewsTicker />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <LeftSidebar />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                <p className="text-xl text-gray-600 mb-2">Get in touch with our team</p>
                <p className="text-lg text-gray-600 font-hindi">हमारी टीम से संपर्क करें</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-blue-50 rounded-xl text-center">
                  <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Phone Numbers</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <a href="tel:+919993820711" className="hover:text-blue-600">+91 99938 20711</a>
                    </p>
                    <p className="text-gray-700">
                      <a href="tel:+918818882105" className="hover:text-blue-600">+91 88188 82105</a>
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-green-50 rounded-xl text-center">
                  <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Email</h3>
                  <p className="text-gray-700">
                    <a href="mailto:contact@ODnews.com" className="hover:text-green-600">contact@ODnews.com</a>
                  </p>
                </div>

                <div className="p-6 bg-purple-50 rounded-xl text-center">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                  <div className="space-y-1 text-gray-700">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-xl text-center">
                  <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Support</h3>
                  <div className="space-y-1 text-gray-700">
                    <p>Technical Support</p>
                    <p>Editorial Inquiries</p>
                    <p>Advertising Support</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Contact Form</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea rows={5} className="w-full p-3 border border-gray-300 rounded-lg"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

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