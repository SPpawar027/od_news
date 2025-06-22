import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import VideoManagement from "@/components/admin/VideoManagement";

export default function AdminVideosPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Video Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Upload and manage entertainment videos with metadata and quality settings
              </p>
            </div>

            <VideoManagement />
          </div>
        </main>
      </div>
    </div>
  );
}