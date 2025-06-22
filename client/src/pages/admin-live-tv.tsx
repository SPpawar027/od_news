import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LiveStreamManagement from "@/components/admin/LiveStreamManagement";

export default function AdminLiveTVPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Live TV Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage live streaming channels with M3U8, YouTube, and custom RTMP support
              </p>
            </div>

            <LiveStreamManagement />
          </div>
        </main>
      </div>
    </div>
  );
}