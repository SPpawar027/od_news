import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Cookie Policy - OD News"
        description="Learn about how OD News uses cookies and similar technologies to enhance your browsing experience."
        keywords="cookies, policy, privacy, OD News, tracking"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
              
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">Last updated: January 2025</p>
                
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience and allow certain features to function properly.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you which amount to a request for services.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Advertising Cookies</h3>
                    <p className="text-gray-700 mb-4">
                      These cookies are used to make advertising messages more relevant to you and your interests.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
                  </p>
                  <p className="text-gray-700 mb-4">
                    However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                  <p className="text-gray-700 mb-4">
                    If you have any questions about our Cookie Policy, please contact us at:
                  </p>
                  <ul className="text-gray-700 space-y-2">
                    <li>Email: privacy@ODnews.com</li>
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