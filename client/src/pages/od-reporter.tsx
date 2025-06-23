import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import { Users, Award, Camera, Edit } from "lucide-react";

export default function ODReporterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="OD Reporter - Join Our Team"
        description="Become an OD Reporter and contribute to independent journalism. Join our team of dedicated news professionals."
        keywords="OD Reporter, journalism jobs, news reporter, media careers"
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">OD Reporter</h1>
                <p className="text-xl text-gray-600 mb-2">Join our team of dedicated journalists</p>
                <p className="text-lg text-gray-600 font-hindi">हमारे समर्पित पत्रकारों की टीम से जुड़ें</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-blue-50 rounded-xl text-center">
                  <Edit className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Field Reporter</h3>
                  <p className="text-gray-600">Cover breaking news, events, and stories from the ground</p>
                </div>

                <div className="p-6 bg-green-50 rounded-xl text-center">
                  <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Video Journalist</h3>
                  <p className="text-gray-600">Create compelling video content and live reports</p>
                </div>

                <div className="p-6 bg-purple-50 rounded-xl text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Community Correspondent</h3>
                  <p className="text-gray-600">Report on local community issues and developments</p>
                </div>

                <div className="p-6 bg-orange-50 rounded-xl text-center">
                  <Award className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Investigative Reporter</h3>
                  <p className="text-gray-600">Conduct in-depth research and investigative journalism</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Qualifications</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Bachelor's degree in Journalism or related field</li>
                      <li>• Strong command of Hindi and English</li>
                      <li>• Excellent writing and communication skills</li>
                      <li>• Basic knowledge of digital media</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Skills</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Previous journalism experience</li>
                      <li>• Video production and editing</li>
                      <li>• Social media management</li>
                      <li>• Photography skills</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join?</h2>
                <p className="text-gray-600 mb-6">Send your resume and portfolio to join our team</p>
                <a 
                  href="mailto:careers@ODnews.com" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Apply Now
                </a>
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