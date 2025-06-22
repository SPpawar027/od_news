import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import RSSManagement from "@/components/admin/RSSManagement";

export default function AdminRSSPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      
      <div className="lg:pl-64">
        <AdminHeader />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                RSS Feed Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Configure RSS sources for automatic content import and syndication
              </p>
            </div>

            <RSSManagement />
          </div>
        </main>
      </div>
    </div>
  );
}