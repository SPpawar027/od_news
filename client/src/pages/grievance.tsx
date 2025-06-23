import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

export default function GrievancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Grievance Redressal Policy - OD News"
        description="Learn about OD News grievance redressal mechanism and how to file complaints or concerns."
        keywords="grievance, redressal, complaints, OD News, policy"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Grievance Redressal Policy</h1>
              
              <div className="prose max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                  <p className="text-gray-700 mb-4">
                    OD News is committed to providing transparent and effective grievance redressal mechanism for all stakeholders including readers, advertisers, and content creators.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Grievances</h2>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• Content accuracy and editorial concerns</li>
                    <li>• Privacy and data protection issues</li>
                    <li>• Advertisement-related complaints</li>
                    <li>• Technical issues and website problems</li>
                    <li>• Copyright and intellectual property matters</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">How to File a Complaint</h2>
                  <div className="bg-blue-50 p-6 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <p className="text-gray-700 mb-2">Email: grievance@ODnews.com</p>
                    <p className="text-gray-700 mb-2">Phone: +91 99938 20711</p>
                    <p className="text-gray-700">Address: OD News Grievance Cell</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Resolution Timeline</h2>
                  <ul className="text-gray-700 space-y-2 mb-4">
                    <li>• Acknowledgment: Within 24 hours</li>
                    <li>• Investigation: 3-7 working days</li>
                    <li>• Resolution: Within 15 working days</li>
                    <li>• Complex cases: Up to 30 working days</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Escalation Process</h2>
                  <p className="text-gray-700 mb-4">
                    If you are not satisfied with the initial resolution, you may escalate your complaint to our editorial board at editorial@ODnews.com
                  </p>
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