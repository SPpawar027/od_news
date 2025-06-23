import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Privacy Policy - OD News"
        description="Learn how OD News protects your privacy and handles your personal information."
        keywords="privacy, policy, data protection, OD News, personal information"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
              
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">Last updated: January 2025</p>
                
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                  <p className="text-gray-700 mb-4">
                    We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• Contact information (name, email address, phone number)</li>
                    <li>• Account information and preferences</li>
                    <li>• Comments and feedback</li>
                    <li>• Usage data and analytics</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                  <p className="text-gray-700 mb-4">
                    We use the information we collect to provide, maintain, and improve our services:
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• To provide and deliver the services you request</li>
                    <li>• To send you news updates and newsletters</li>
                    <li>• To respond to your comments and questions</li>
                    <li>• To improve our website and user experience</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                  <p className="text-gray-700 mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                  <p className="text-gray-700 mb-4">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                  <p className="text-gray-700 mb-4">
                    You have the right to:
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• Access your personal information</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Request deletion of your information</li>
                    <li>• Opt-out of marketing communications</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li>Email: privacy@ODnews.com</li>
                    <li>Phone: +91 99938 20711</li>
                    <li>Address: OD News Privacy Office</li>
                  </ul>
                </section>
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