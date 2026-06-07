import { useState, useEffect } from 'react';
import { hardNavigate } from '../lib/nav'
import { MapPin, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import PortalHeader from '../components/PortalHeader';
import LocationManagement from '../components/admin/LocationManagement';
import KeywordManagement from '../components/admin/KeywordManagement';

type TabType = 'locations' | 'auto-linking';

export default function TempAdminPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('locations');

  useEffect(() => {
    if (!authLoading && !user) {
      hardNavigate('/portal/login');
      return;
    }

    if (!authLoading && user && userRole) {
      if (userRole.role !== 'temp_admin' && userRole.role !== 'admin') {
        alert('Access denied. Temporary admin privileges required.');
        hardNavigate('/');
      }
    }
  }, [user, userRole, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C73532]"></div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  const tabs = [
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'auto-linking', label: 'Auto-Linking', icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Temporary Admin Portal - National Removals and Storage"
        description="Manage locations and auto-linking content"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/temp-admin"
        noindex={true}
      />

      <PortalHeader title="Temporary Admin Portal" />

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Temporary Admin Portal</h1>
              <p className="text-gray-300 mt-1">Manage Locations and Auto-Linking Content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex border-b">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'text-[#C73532] border-b-2 border-[#C73532]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'locations' && <LocationManagement />}

        {activeTab === 'auto-linking' && <KeywordManagement />}
      </div>
    </div>
  );
}
