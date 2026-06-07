import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { MapPin, Link as LinkIcon, Home, LogOut, Menu, X as CloseIcon, Package, ClipboardList, LayoutDashboard, FileText, Search, Users } from 'lucide-react';
import { hardNavigate } from '../lib/nav'
import { useAuth } from '../contexts/AuthContext';
import LocationManagement from '../components/admin/LocationManagement';
import KeywordManagement from '../components/admin/KeywordManagement';
import PackagingOrdersManagement from '../components/admin/PackagingOrdersManagement';
import QuotesManagement from '../components/admin/QuotesManagement';
import DashboardOverview from '../components/admin/DashboardOverview';
import ArticleManagement from '../components/admin/ArticleManagement';
import ComprehensiveSEOManagement from '../components/admin/ComprehensiveSEOManagement';
import UserManagementAdmin2 from '../components/admin/UserManagementAdmin2';
import SEO from '../components/SEO';

export default function Admin2Page() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cities' | 'keywords' | 'quotes' | 'packaging' | 'articles' | 'seo' | 'users'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    hardNavigate('/');
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'cities' as const, label: 'Cities', icon: MapPin },
    { id: 'articles' as const, label: 'Articles', icon: FileText },
    { id: 'seo' as const, label: 'SEO Management', icon: Search },
    { id: 'keywords' as const, label: 'Auto-Linking', icon: LinkIcon },
    { id: 'quotes' as const, label: 'Quote Requests', icon: ClipboardList },
    { id: 'packaging' as const, label: 'Packaging Orders', icon: Package },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'admin-2']}>
      <div className="min-h-screen bg-gray-50">
      <SEO
        title="Admin Portal - National Removals and Storage"
        description="Advanced admin dashboard for content and SEO management"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/admin"
        noindex={true}
      />
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Admin Portal</h1>
            <p className="text-xs text-gray-400">Management Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col z-50
            transform transition-transform duration-300 ease-in-out overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                <p className="text-sm text-gray-400 mt-1">Management Dashboard</p>
              </div>
              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700"
              >
                <CloseIcon size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${
                      activeTab === tab.id
                        ? 'bg-[#C73532] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => hardNavigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Website</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'cities' && 'City Management'}
                {activeTab === 'articles' && 'Article Management'}
                {activeTab === 'seo' && 'SEO Management'}
                {activeTab === 'keywords' && 'Auto-Linking Keywords'}
                {activeTab === 'quotes' && 'Quote Requests Management'}
                {activeTab === 'packaging' && 'Packaging Orders Management'}
              </h2>
              <p className="mt-2 text-gray-600 text-sm lg:text-base">
                {activeTab === 'dashboard' && 'Overview of all your business operations and statistics'}
                {activeTab === 'users' && 'Create, edit, delete users and manage passwords for all accounts'}
                {activeTab === 'cities' && 'Add, edit, and manage city locations and their SEO content'}
                {activeTab === 'articles' && 'Create and manage blog posts, guides, and articles'}
                {activeTab === 'seo' && 'Manage meta tags, OpenGraph, canonical URLs, and sitemap settings'}
                {activeTab === 'keywords' && 'Manage keywords and auto-linking settings for better SEO'}
                {activeTab === 'quotes' && 'View, accept, and reject customer quote requests'}
                {activeTab === 'packaging' && 'View and manage all packaging material orders'}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              {activeTab === 'dashboard' && <DashboardOverview />}
              {activeTab === 'users' && <UserManagementAdmin2 />}
              {activeTab === 'cities' && <LocationManagement />}
              {activeTab === 'articles' && <ArticleManagement />}
              {activeTab === 'seo' && <ComprehensiveSEOManagement />}
              {activeTab === 'keywords' && <KeywordManagement />}
              {activeTab === 'quotes' && <QuotesManagement />}
              {activeTab === 'packaging' && <PackagingOrdersManagement />}
            </div>
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  );
}
