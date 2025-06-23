import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Terms & Conditions - OD News"
        description="Read the terms and conditions for using OD News platform and services."
        keywords="terms, conditions, legal, OD News, policy"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
              
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">Last updated: January 2025</p>
                
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 mb-4">
                    By accessing and using OD News website and services, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Content Usage</h2>
                  <p className="text-gray-700 mb-4">
                    All content published on OD News is protected by copyright laws. Users may share articles with proper attribution but cannot reproduce content for commercial purposes without written permission.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
                  <p className="text-gray-700 mb-4">
                    Users agree not to use the service for any unlawful purpose or to solicit others to perform unlawful acts. You will not post content that is defamatory, abusive, or threatening.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy Policy</h2>
                  <p className="text-gray-700 mb-4">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Disclaimer</h2>
                  <p className="text-gray-700 mb-4">
                    The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
                  <p className="text-gray-700 mb-4">
                    For questions about these Terms & Conditions, please contact us at:
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li>Email: legal@ODnews.com</li>
                    <li>Phone: +91 99938 20711</li>
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